import { Router, Response } from 'express';
import { AuthService } from '../auth';
import User from '../models/User';
import Connection from '../models/Connection';
import Message from '../models/Message';
import Post from '../models/Post';
import Comment from '../models/Comment';

export const communityRouter = Router();
const currentUser = (req: any) => String(req.user.userId);

function publicUser(user: any) {
  return { id: String(user._id), name: user.name, profilePicture: user.profile_picture, classification: user.classification };
}

function publicPost(post: any, author: any, userId: string, commentCount = 0) {
  return { id: String(post._id), authorId: post.authorId, authorName: author?.name || 'Community member', authorInitials: initials(author?.name || 'Community member'), timeAgo: 'Just now', title: post.title, content: post.content, category: post.category, likes: post.likes || 0, likedByMe: (post.likedBy || []).includes(userId), commentCount, comments: [] };
}

function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); }

communityRouter.get('/posts', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(100);
    const [authors, comments] = await Promise.all([
      User.find({ _id: { $in: posts.map(post => post.authorId) } }),
      Comment.find({ postId: { $in: posts.map(post => String(post._id)) } }).select('postId'),
    ]);
    const commentCounts = new Map<string, number>();
    comments.forEach(comment => {
      commentCounts.set(comment.postId, (commentCounts.get(comment.postId) || 0) + 1);
    });
    const userId = currentUser(req);
    res.json({ posts: posts.map(post => publicPost(
      post,
      authors.find(author => String(author._id) === post.authorId),
      userId,
      commentCounts.get(String(post._id)) || 0
    )) });
  } catch (error) { console.error('Community posts error:', error); res.status(500).json({ error: 'Could not load community posts' }); }
});

communityRouter.post('/posts', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const title = String(req.body?.title || '').trim(); const content = String(req.body?.content || '').trim(); const category = String(req.body?.category || 'General');
    if (!title || !content || title.length > 160 || content.length > 10000) return res.status(400).json({ error: 'Post title and content are required' });
    const post = await Post.create({ authorId: currentUser(req), title, content, category });
    const author = await User.findById(currentUser(req));
    res.status(201).json({ post: publicPost(post, author, currentUser(req)) });
  } catch (error) { console.error('Community create post error:', error); res.status(500).json({ error: 'Could not create post' }); }
});

communityRouter.get('/posts/:postId', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Discussion not found' });
    const [author, commentCount] = await Promise.all([
      User.findById(post.authorId),
      Comment.countDocuments({ postId: String(post._id) }),
    ]);
    res.json({ post: publicPost(post, author, currentUser(req), commentCount) });
  } catch (error) { console.error('Community post error:', error); res.status(500).json({ error: 'Could not load discussion' }); }
});

communityRouter.post('/posts/:postId/like', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = currentUser(req);
    const action = req.body?.action;
    if (action !== 'like' && action !== 'unlike') {
      return res.status(400).json({ error: 'Action must be like or unlike' });
    }

    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.postId,
        likedBy: action === 'like' ? { $ne: userId } : userId,
      },
      action === 'like'
        ? { $addToSet: { likedBy: userId }, $inc: { likes: 1 } }
        : { $pull: { likedBy: userId }, $inc: { likes: -1 } },
      { new: true }
    ) || await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ error: 'Discussion not found' });
    res.json({ likes: Math.max(0, post.likes || 0), likedByMe: (post.likedBy || []).includes(userId) });
  } catch (error) { console.error('Community like error:', error); res.status(500).json({ error: 'Could not update like' }); }
});

communityRouter.get('/posts/:postId/comments', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const comments = await Comment.find({ postId: String(req.params.postId) }).sort({ createdAt: 1 });
    const authors = await User.find({ _id: { $in: comments.map(comment => comment.authorId) } });
    res.json({ comments: comments.map(comment => {
      const authorName = authors.find(author => String(author._id) === comment.authorId)?.name || 'Community member';
      return { id: String(comment._id), authorName, authorInitials: initials(authorName), content: comment.content, timeAgo: 'Recently' };
    }) });
  } catch (error) { console.error('Community comments error:', error); res.status(500).json({ error: 'Could not load comments' }); }
});

communityRouter.post('/posts/:postId/comments', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const content = String(req.body?.content || '').trim();
    if (!content || content.length > 5000) return res.status(400).json({ error: 'Comment must be between 1 and 5000 characters' });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = await Comment.create({ postId: String(post._id), authorId: currentUser(req), content });
    const author = await User.findById(currentUser(req));
    const authorName = author?.name || 'Community member';
    res.status(201).json({ comment: { id: String(comment._id), authorName, authorInitials: initials(authorName), content, timeAgo: 'Just now' } });
  } catch (error) { console.error('Community create comment error:', error); res.status(500).json({ error: 'Could not add comment' }); }
});

communityRouter.get('/people', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const id = currentUser(req);
    const users = await User.find({ _id: { $ne: id } }).sort({ created_at: -1 }).limit(50);
    const connections = await Connection.find({ $or: [{ requesterId: id }, { recipientId: id }] });
    const statusFor = (targetId: string) => { const connection = connections.find(item => item.requesterId === targetId || item.recipientId === targetId); if (!connection) return 'none'; if (connection.status === 'accepted') return 'connected'; if (connection.recipientId === id) return 'incoming'; return connection.status; };
    res.json({ people: users.map(user => ({ ...publicUser(user), connectionStatus: statusFor(String(user._id)) })) });
  } catch (error) { console.error('Community people error:', error); res.status(500).json({ error: 'Could not load community members' }); }
});

communityRouter.get('/connections', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const id = currentUser(req);
    const connections = await Connection.find({ $or: [{ requesterId: id }, { recipientId: id }], status: 'accepted' });
    const ids = connections.map(connection => connection.requesterId === id ? connection.recipientId : connection.requesterId);
    const users = await User.find({ _id: { $in: ids } });
    res.json({ connections: users.map(publicUser) });
  } catch (error) { console.error('Community connections error:', error); res.status(500).json({ error: 'Could not load connections' }); }
});

communityRouter.get('/inbox', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const id = currentUser(req);
    const requests = await Connection.find({ recipientId: id, status: 'pending' }).sort({ createdAt: -1 });
    const requesters = await User.find({ _id: { $in: requests.map(request => request.requesterId) } });
    const recentMessages = await Message.find({ recipientId: id }).sort({ createdAt: -1 }).limit(50);
    const senderIds = [...new Set(recentMessages.map(message => message.senderId))];
    const senders = await User.find({ _id: { $in: senderIds } });
    res.json({ requests: requesters.map(publicUser), messages: recentMessages.map(message => ({ id: String(message._id), sender: publicUser(senders.find(sender => String(sender._id) === message.senderId)), text: message.text, createdAt: message.createdAt })) });
  } catch (error) { console.error('Community inbox error:', error); res.status(500).json({ error: 'Could not load your inbox' }); }
});

communityRouter.post('/connect/:targetId', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const requesterId = currentUser(req);
    const recipientId = String(req.params.targetId);
    if (requesterId === recipientId) return res.status(400).json({ error: 'You cannot connect with yourself' });
    const target = await User.findById(recipientId);
    if (!target) return res.status(404).json({ error: 'Member not found' });
    let connection = await Connection.findOne({ $or: [{ requesterId, recipientId }, { requesterId: recipientId, recipientId: requesterId }] });
    const action = req.body?.action || 'request';
    if (action === 'accept' && connection?.recipientId === requesterId) connection.status = 'accepted';
    else if (action === 'decline' && connection?.recipientId === requesterId) connection.status = 'declined';
    else if (action === 'disconnect' && connection) {
      await Connection.deleteOne({ _id: connection._id });
      return res.json({ status: 'none', target: publicUser(target) });
    }
    else if (action === 'request' && connection?.status === 'declined') {
      connection.requesterId = requesterId;
      connection.recipientId = recipientId;
      connection.status = 'pending';
    }
    else if (!connection) connection = new Connection({ requesterId, recipientId, status: 'pending' });
    else return res.status(409).json({ error: 'Connection already exists' });
    await connection.save();
    res.json({ status: connection.status, target: publicUser(target) });
  } catch (error) { console.error('Community connect error:', error); res.status(500).json({ error: 'Could not update connection' }); }
});

communityRouter.get('/messages/:userId', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const id = currentUser(req); const otherId = String(req.params.userId);
    const connected = await Connection.exists({ $or: [{ requesterId: id, recipientId: otherId }, { requesterId: otherId, recipientId: id }], status: 'accepted' });
    if (!connected) return res.status(403).json({ error: 'Connect before starting a chat' });
    const messages = await Message.find({ $or: [{ senderId: id, recipientId: otherId }, { senderId: otherId, recipientId: id }] }).sort({ createdAt: 1 }).limit(200);
    const participant = await User.findById(otherId);
    res.json({ participant: participant ? publicUser(participant) : null, messages: messages.map(message => ({ id: String(message._id), senderId: message.senderId, text: message.text, createdAt: message.createdAt })) });
  } catch (error) { console.error('Community messages error:', error); res.status(500).json({ error: 'Could not load messages' }); }
});

communityRouter.post('/messages/:userId', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const senderId = currentUser(req); const recipientId = String(req.params.userId); const text = String(req.body?.text || '').trim();
    if (!text || text.length > 2000) return res.status(400).json({ error: 'Message must be between 1 and 2000 characters' });
    const connected = await Connection.exists({ $or: [{ requesterId: senderId, recipientId }, { requesterId: recipientId, recipientId: senderId }], status: 'accepted' });
    if (!connected) return res.status(403).json({ error: 'Connect before starting a chat' });
    const message = await Message.create({ senderId, recipientId, text });
    res.status(201).json({ message: { id: String(message._id), senderId, text: message.text, createdAt: message.createdAt } });
  } catch (error) { console.error('Community send message error:', error); res.status(500).json({ error: 'Could not send message' }); }
});
