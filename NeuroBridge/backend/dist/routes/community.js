"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../auth");
const User_1 = __importDefault(require("../models/User"));
const Connection_1 = __importDefault(require("../models/Connection"));
const Message_1 = __importDefault(require("../models/Message"));
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
exports.communityRouter = (0, express_1.Router)();
const currentUser = (req) => String(req.user.userId);
function publicUser(user) {
    return { id: String(user._id), name: user.name, profilePicture: user.profile_picture, classification: user.classification };
}
function publicPost(post, author, userId, commentCount = 0) {
    return { id: String(post._id), authorId: post.authorId, authorName: author?.name || 'Community member', authorInitials: initials(author?.name || 'Community member'), timeAgo: 'Just now', title: post.title, content: post.content, category: post.category, likes: post.likes || 0, likedByMe: (post.likedBy || []).includes(userId), commentCount, comments: [] };
}
function initials(name) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); }
exports.communityRouter.get('/posts', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const posts = await Post_1.default.find().sort({ createdAt: -1 }).limit(100);
        const [authors, comments] = await Promise.all([
            User_1.default.find({ _id: { $in: posts.map(post => post.authorId) } }),
            Comment_1.default.find({ postId: { $in: posts.map(post => String(post._id)) } }).select('postId'),
        ]);
        const commentCounts = new Map();
        comments.forEach(comment => {
            commentCounts.set(comment.postId, (commentCounts.get(comment.postId) || 0) + 1);
        });
        const userId = currentUser(req);
        res.json({ posts: posts.map(post => publicPost(post, authors.find(author => String(author._id) === post.authorId), userId, commentCounts.get(String(post._id)) || 0)) });
    }
    catch (error) {
        console.error('Community posts error:', error);
        res.status(500).json({ error: 'Could not load community posts' });
    }
});
exports.communityRouter.post('/posts', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const title = String(req.body?.title || '').trim();
        const content = String(req.body?.content || '').trim();
        const category = String(req.body?.category || 'General');
        if (!title || !content || title.length > 160 || content.length > 10000)
            return res.status(400).json({ error: 'Post title and content are required' });
        const post = await Post_1.default.create({ authorId: currentUser(req), title, content, category });
        const author = await User_1.default.findById(currentUser(req));
        res.status(201).json({ post: publicPost(post, author, currentUser(req)) });
    }
    catch (error) {
        console.error('Community create post error:', error);
        res.status(500).json({ error: 'Could not create post' });
    }
});
exports.communityRouter.get('/posts/:postId', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ error: 'Discussion not found' });
        const [author, commentCount] = await Promise.all([
            User_1.default.findById(post.authorId),
            Comment_1.default.countDocuments({ postId: String(post._id) }),
        ]);
        res.json({ post: publicPost(post, author, currentUser(req), commentCount) });
    }
    catch (error) {
        console.error('Community post error:', error);
        res.status(500).json({ error: 'Could not load discussion' });
    }
});
exports.communityRouter.post('/posts/:postId/like', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const userId = currentUser(req);
        const action = req.body?.action;
        if (action !== 'like' && action !== 'unlike') {
            return res.status(400).json({ error: 'Action must be like or unlike' });
        }
        const post = await Post_1.default.findOneAndUpdate({
            _id: req.params.postId,
            likedBy: action === 'like' ? { $ne: userId } : userId,
        }, action === 'like'
            ? { $addToSet: { likedBy: userId }, $inc: { likes: 1 } }
            : { $pull: { likedBy: userId }, $inc: { likes: -1 } }, { new: true }) || await Post_1.default.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ error: 'Discussion not found' });
        res.json({ likes: Math.max(0, post.likes || 0), likedByMe: (post.likedBy || []).includes(userId) });
    }
    catch (error) {
        console.error('Community like error:', error);
        res.status(500).json({ error: 'Could not update like' });
    }
});
exports.communityRouter.get('/posts/:postId/comments', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const comments = await Comment_1.default.find({ postId: String(req.params.postId) }).sort({ createdAt: 1 });
        const authors = await User_1.default.find({ _id: { $in: comments.map(comment => comment.authorId) } });
        res.json({ comments: comments.map(comment => {
                const authorName = authors.find(author => String(author._id) === comment.authorId)?.name || 'Community member';
                return { id: String(comment._id), authorName, authorInitials: initials(authorName), content: comment.content, timeAgo: 'Recently' };
            }) });
    }
    catch (error) {
        console.error('Community comments error:', error);
        res.status(500).json({ error: 'Could not load comments' });
    }
});
exports.communityRouter.post('/posts/:postId/comments', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const content = String(req.body?.content || '').trim();
        if (!content || content.length > 5000)
            return res.status(400).json({ error: 'Comment must be between 1 and 5000 characters' });
        const post = await Post_1.default.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ error: 'Post not found' });
        const comment = await Comment_1.default.create({ postId: String(post._id), authorId: currentUser(req), content });
        const author = await User_1.default.findById(currentUser(req));
        const authorName = author?.name || 'Community member';
        res.status(201).json({ comment: { id: String(comment._id), authorName, authorInitials: initials(authorName), content, timeAgo: 'Just now' } });
    }
    catch (error) {
        console.error('Community create comment error:', error);
        res.status(500).json({ error: 'Could not add comment' });
    }
});
exports.communityRouter.get('/people', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const id = currentUser(req);
        const users = await User_1.default.find({ _id: { $ne: id } }).sort({ created_at: -1 }).limit(50);
        const connections = await Connection_1.default.find({ $or: [{ requesterId: id }, { recipientId: id }] });
        const statusFor = (targetId) => { const connection = connections.find(item => item.requesterId === targetId || item.recipientId === targetId); if (!connection)
            return 'none'; if (connection.status === 'accepted')
            return 'connected'; if (connection.recipientId === id)
            return 'incoming'; return connection.status; };
        res.json({ people: users.map(user => ({ ...publicUser(user), connectionStatus: statusFor(String(user._id)) })) });
    }
    catch (error) {
        console.error('Community people error:', error);
        res.status(500).json({ error: 'Could not load community members' });
    }
});
exports.communityRouter.get('/connections', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const id = currentUser(req);
        const connections = await Connection_1.default.find({ $or: [{ requesterId: id }, { recipientId: id }], status: 'accepted' });
        const ids = connections.map(connection => connection.requesterId === id ? connection.recipientId : connection.requesterId);
        const users = await User_1.default.find({ _id: { $in: ids } });
        res.json({ connections: users.map(publicUser) });
    }
    catch (error) {
        console.error('Community connections error:', error);
        res.status(500).json({ error: 'Could not load connections' });
    }
});
exports.communityRouter.get('/inbox', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const id = currentUser(req);
        const requests = await Connection_1.default.find({ recipientId: id, status: 'pending' }).sort({ createdAt: -1 });
        const requesters = await User_1.default.find({ _id: { $in: requests.map(request => request.requesterId) } });
        const recentMessages = await Message_1.default.find({ recipientId: id }).sort({ createdAt: -1 }).limit(50);
        const senderIds = [...new Set(recentMessages.map(message => message.senderId))];
        const senders = await User_1.default.find({ _id: { $in: senderIds } });
        res.json({ requests: requesters.map(publicUser), messages: recentMessages.map(message => ({ id: String(message._id), sender: publicUser(senders.find(sender => String(sender._id) === message.senderId)), text: message.text, createdAt: message.createdAt })) });
    }
    catch (error) {
        console.error('Community inbox error:', error);
        res.status(500).json({ error: 'Could not load your inbox' });
    }
});
exports.communityRouter.post('/connect/:targetId', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const requesterId = currentUser(req);
        const recipientId = String(req.params.targetId);
        if (requesterId === recipientId)
            return res.status(400).json({ error: 'You cannot connect with yourself' });
        const target = await User_1.default.findById(recipientId);
        if (!target)
            return res.status(404).json({ error: 'Member not found' });
        let connection = await Connection_1.default.findOne({ $or: [{ requesterId, recipientId }, { requesterId: recipientId, recipientId: requesterId }] });
        const action = req.body?.action || 'request';
        if (action === 'accept' && connection?.recipientId === requesterId)
            connection.status = 'accepted';
        else if (action === 'decline' && connection?.recipientId === requesterId)
            connection.status = 'declined';
        else if (action === 'disconnect' && connection) {
            await Connection_1.default.deleteOne({ _id: connection._id });
            return res.json({ status: 'none', target: publicUser(target) });
        }
        else if (action === 'request' && connection?.status === 'declined') {
            connection.requesterId = requesterId;
            connection.recipientId = recipientId;
            connection.status = 'pending';
        }
        else if (!connection)
            connection = new Connection_1.default({ requesterId, recipientId, status: 'pending' });
        else
            return res.status(409).json({ error: 'Connection already exists' });
        await connection.save();
        res.json({ status: connection.status, target: publicUser(target) });
    }
    catch (error) {
        console.error('Community connect error:', error);
        res.status(500).json({ error: 'Could not update connection' });
    }
});
exports.communityRouter.get('/messages/:userId', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const id = currentUser(req);
        const otherId = String(req.params.userId);
        const connected = await Connection_1.default.exists({ $or: [{ requesterId: id, recipientId: otherId }, { requesterId: otherId, recipientId: id }], status: 'accepted' });
        if (!connected)
            return res.status(403).json({ error: 'Connect before starting a chat' });
        const messages = await Message_1.default.find({ $or: [{ senderId: id, recipientId: otherId }, { senderId: otherId, recipientId: id }] }).sort({ createdAt: 1 }).limit(200);
        const participant = await User_1.default.findById(otherId);
        res.json({ participant: participant ? publicUser(participant) : null, messages: messages.map(message => ({ id: String(message._id), senderId: message.senderId, text: message.text, createdAt: message.createdAt })) });
    }
    catch (error) {
        console.error('Community messages error:', error);
        res.status(500).json({ error: 'Could not load messages' });
    }
});
exports.communityRouter.post('/messages/:userId', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const senderId = currentUser(req);
        const recipientId = String(req.params.userId);
        const text = String(req.body?.text || '').trim();
        if (!text || text.length > 2000)
            return res.status(400).json({ error: 'Message must be between 1 and 2000 characters' });
        const connected = await Connection_1.default.exists({ $or: [{ requesterId: senderId, recipientId }, { requesterId: recipientId, recipientId: senderId }], status: 'accepted' });
        if (!connected)
            return res.status(403).json({ error: 'Connect before starting a chat' });
        const message = await Message_1.default.create({ senderId, recipientId, text });
        res.status(201).json({ message: { id: String(message._id), senderId, text: message.text, createdAt: message.createdAt } });
    }
    catch (error) {
        console.error('Community send message error:', error);
        res.status(500).json({ error: 'Could not send message' });
    }
});
