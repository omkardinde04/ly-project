import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Heart,
  MessageSquare,
  Share2,
  ArrowLeft,
  Users,
  Plus,
  Send,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CommunityNetwork } from './CommunityNetwork';

// --- Types ---
type Category = 'General' | 'Study & Learning' | 'Career' | 'Experiences' | 'Questions';

interface Comment {
  id: string;
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  content: string;
}

interface Post {
  id: string;
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  title: string;
  content: string;
  category: Category;
  likes: number;
  comments: Comment[];
  commentCount: number;
  likedByMe?: boolean;
}

const CATEGORIES: Category[] = [
  'General',
  'Study & Learning',
  'Career',
  'Experiences',
  'Questions',
];

export function Community() {
  const { user, token } = useAuth();
  const sharedPostId = useRef(new URLSearchParams(window.location.search).get('communityPost'));

  // State
  const [view, setView] = useState<'feed' | 'create' | 'detail'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const [reloadPosts, setReloadPosts] = useState(0);

  // Create Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Category>('General');

  useEffect(() => {
    const controller = new AbortController();
    const loadPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError('');
      if (!token) {
        setPosts([]);
        setIsLoadingPosts(false);
        setPostsError('Sign in to view community discussions.');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/api/community/posts', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load discussions.');
        if (!Array.isArray(data.posts)) throw new Error('The discussion list could not be read.');
        setPosts(data.posts);
        setLikedPostIds(
          new Set(data.posts.filter((post: Post) => post.likedByMe).map((post: Post) => post.id))
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setPosts([]);
        setPostsError(error instanceof Error ? error.message : 'Could not load discussions.');
      } finally {
        if (!controller.signal.aborted) setIsLoadingPosts(false);
      }
    };

    void loadPosts();
    return () => controller.abort();
  }, [token, reloadPosts]);

  useEffect(() => {
    const postId = sharedPostId.current;
    if (!postId || isLoadingPosts || !token) return;
    sharedPostId.current = null;
    const post = posts.find((item) => item.id === postId);
    if (post) {
      setActivePost(post);
      setView('detail');
      return;
    }

    const controller = new AbortController();
    const loadSharedPost = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/community/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !data.post) {
          throw new Error(data.error || 'Could not load the shared discussion.');
        }
        setActivePost(data.post);
        if (data.post.likedByMe) {
          setLikedPostIds((current) => new Set(current).add(data.post.id));
        }
        setView('detail');
      } catch (error) {
        if (!controller.signal.aborted) {
          setActionError(error instanceof Error ? error.message : 'Could not load the shared discussion.');
        }
      }
    };

    void loadSharedPost();
    return () => controller.abort();
  }, [isLoadingPosts, posts, token]);

  useEffect(() => {
    if (!activePost || !token) return;
    const controller = new AbortController();
    const loadComments = async () => {
      setActionError('');
      setIsLoadingComments(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/community/posts/${activePost.id}/comments`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load replies.');
        setActivePost((current) =>
          current ? { ...current, comments: data.comments || [] } : current
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setActionError(error instanceof Error ? error.message : 'Could not load replies.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingComments(false);
      }
    };

    void loadComments();
    return () => controller.abort();
  }, [activePost?.id, token]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !token || isCreatingPost) return;
    setIsCreatingPost(true);
    setActionError('');
    setActionNotice('');
    try {
      const response = await fetch('http://localhost:4000/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          category: newPostCategory,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.post) {
        throw new Error(data.error || 'Could not publish discussion.');
      }
      setPosts((current) => [data.post, ...current]);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('General');
      setView('feed');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not publish discussion.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleAddComment = async () => {
    if (!activePost || !commentDraft.trim() || !token) return;
    setActionError('');
    try {
      const response = await fetch(
        `http://localhost:4000/api/community/posts/${activePost.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: commentDraft.trim() }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.comment) throw new Error(data.error || 'Could not add reply.');
      const updated = {
        ...activePost,
        comments: [...activePost.comments, data.comment],
        commentCount: activePost.commentCount + 1,
      };
      setActivePost(updated);
      setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
      setCommentDraft('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not add reply.');
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!token || pendingLikeIds.has(postId)) return;
    const isLiked = likedPostIds.has(postId);
    setActionError('');
    setPendingLikeIds((current) => new Set(current).add(postId));
    try {
      const response = await fetch(`http://localhost:4000/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update like.');
      setLikedPostIds((current) => {
        const updated = new Set(current);
        if (data.likedByMe) updated.add(postId);
        else updated.delete(postId);
        return updated;
      });
      setPosts((current) =>
        current.map((post) => (post.id === postId ? { ...post, likes: data.likes } : post))
      );
      setActivePost((current) =>
        current?.id === postId ? { ...current, likes: data.likes } : current
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update like.');
    } finally {
      setPendingLikeIds((current) => {
        const updated = new Set(current);
        updated.delete(postId);
        return updated;
      });
    }
  };

  const handleSharePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setActionError('');
    setActionNotice('');
    try {
      const shareUrl = new URL('/dashboard', window.location.origin);
      shareUrl.searchParams.set('communityPost', postId);
      await navigator.clipboard.writeText(shareUrl.toString());
      setActionNotice('Discussion link copied.');
    } catch {
      setActionError('Could not copy the discussion link. Check clipboard permissions and try again.');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'Study & Learning':
        return 'bg-blue-50 text-[#2563EB] border-blue-200';
      case 'Career':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Experiences':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Questions':
        return 'bg-orange-50 text-[#E86F51] border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // --- Views ---

  const renderFeed = () => (
    <section className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="font-semibold text-slate-900">Discussions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ideas and answers from the community</p>
        </div>
        <span className="text-xs text-slate-500">{filteredPosts.length} shown</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto px-5 pb-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-[#2563EB] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All discussions ({posts.length})
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoadingPosts ? (
        <div role="status" className="border-t border-slate-100 p-10 text-center text-sm text-slate-500">
          Loading discussions?
        </div>
      ) : postsError ? (
        <div role="alert" className="border-t border-rose-100 bg-rose-50/40 p-8 text-center">
          <p className="text-sm text-rose-700 mb-4">{postsError}</p>
          {token && (
            <button
              type="button"
              onClick={() => setReloadPosts((current) => current + 1)}
              className="px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8]"
            >
              Try again
            </button>
          )}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="border-t border-slate-100 p-10 text-center">
          <MessageSquare size={24} className="mx-auto mb-3 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {posts.length === 0 ? 'Start the conversation' : 'No discussions found'}
          </h3>
          <p className="text-sm text-slate-500 mb-5">
            {posts.length === 0
              ? 'Ask a question or share something that helped you.'
              : 'Try another topic or search term.'}
          </p>
          {posts.length === 0 && (
            <button
              type="button"
              onClick={() => setView('create')}
              className="px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8]"
            >
              Start a discussion
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors cursor-pointer"
              onClick={() => {
                setActionError('');
                setActivePost(post);
                setView('detail');
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-semibold text-sm shrink-0">
                  {post.authorInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                    <span className="font-semibold text-sm text-slate-800">{post.authorName}</span>
                    <span className="text-xs text-slate-400">{post.timeAgo}</span>
                    <span className="text-xs text-[#2563EB]">{post.category}</span>
                  </div>
                  <h2 className="font-semibold text-[15px] text-slate-900 mb-1.5">{post.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{post.content}</p>
                  <div className="flex items-center gap-5 mt-4 text-xs text-slate-500">
                    <button
                      type="button"
                      aria-label={likedPostIds.has(post.id) ? 'Unlike discussion' : 'Like discussion'}
                      disabled={pendingLikeIds.has(post.id)}
                      className={`inline-flex items-center gap-1.5 hover:text-rose-500 disabled:opacity-50 ${
                        likedPostIds.has(post.id) ? 'text-rose-500' : ''
                      }`}
                      onClick={(event) => void handleToggleLike(event, post.id)}
                    >
                      <Heart size={15} className={likedPostIds.has(post.id) ? 'fill-rose-500' : ''} />
                      <span>{post.likes}</span>
                    </button>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare size={15} /> {post.commentCount} replies
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 hover:text-[#2563EB] ml-auto"
                      onClick={(event) => void handleSharePost(event, post.id)}
                      title="Copy discussion link"
                    >
                      <Share2 size={15} /> <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderCreatePost = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-[#1A202C]">Start a Discussion</h2>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
            Share advice, ask questions, or connect with fellow learners.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setView('feed')}
          className="p-2 rounded-xl text-slate-400 hover:text-[#1A202C] hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            value={newPostCategory}
            onChange={(e) => setNewPostCategory(e.target.value as Category)}
            className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] bg-white text-sm text-[#1A202C] font-medium outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-2">
            Discussion Title
          </label>
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="What would you like to discuss? (e.g., Reading strategies that work)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2563EB] bg-white text-sm text-[#1A202C] outline-none placeholder-[#94A3B8]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-2">
            Your Post
          </label>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your thoughts, experiences, questions, or helpful learning tips..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2563EB] bg-white text-sm text-[#1A202C] min-h-[180px] leading-relaxed resize-y outline-none placeholder-[#94A3B8]"
          />
        </div>

        <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setView('feed')}
            className="px-6 py-2.5 font-bold text-xs sm:text-sm text-[#64748B] hover:text-[#1A202C] hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreatePost}
            disabled={!newPostTitle.trim() || !newPostContent.trim() || isCreatingPost}
            className="px-7 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            {isCreatingPost ? 'Publishing...' : 'Publish Discussion'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderPostDetail = () => {
    if (!activePost) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <button
          type="button"
          onClick={() => {
            setView('feed');
            setActivePost(null);
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Community Feed
        </button>

        {/* Post Full Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-black text-sm text-[#2563EB] shrink-0 border border-blue-200">
                {activePost.authorInitials}
              </div>
              <div>
                <div className="font-extrabold text-base text-[#1A202C] flex items-center gap-2">
                  <span>{activePost.authorName}</span>
                  <span className="text-xs font-normal text-[#94A3B8]">
                    · {activePost.timeAgo}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#64748B]">NeuroBridge Member</div>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryBadgeStyle(
                activePost.category
              )}`}
            >
              {activePost.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] mb-4 leading-snug">
            {activePost.title}
          </h1>

          <div className="text-[#1A202C] leading-relaxed whitespace-pre-wrap mb-8 text-sm sm:text-base">
            {activePost.content}
          </div>

          <div className="flex items-center gap-6 pt-5 border-t border-slate-100 text-xs font-bold text-[#64748B]">
            <button
              type="button"
              disabled={pendingLikeIds.has(activePost.id)}
              aria-label={likedPostIds.has(activePost.id) ? 'Unlike discussion' : 'Like discussion'}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                likedPostIds.has(activePost.id)
                  ? 'text-rose-500'
                  : 'hover:text-rose-500 text-[#64748B]'
              }`}
              onClick={(e) => void handleToggleLike(e, activePost.id)}
            >
              <Heart
                size={18}
                className={likedPostIds.has(activePost.id) ? 'fill-rose-500 text-rose-500' : ''}
              />
              <span>{activePost.likes} Likes</span>
            </button>

            <div className="flex items-center gap-1.5 text-[#64748B]">
              <MessageSquare size={18} />
              <span>{activePost.commentCount} Replies</span>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-[#2563EB] transition-colors cursor-pointer ml-auto text-[#94A3B8]"
              onClick={(event) => void handleSharePost(event, activePost.id)}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-blue-100/80 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <h3 className="text-lg font-semibold text-[#1A202C]">
            Replies ({activePost.commentCount})
          </h3>

          {/* Add Comment Input */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
              {getInitials(user?.name || 'You')}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
                placeholder="Write a supportive reply or answer..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] outline-none transition-all placeholder-[#94A3B8]"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!commentDraft.trim()}
                className="px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Comment Thread */}
          <div className="space-y-4 pt-2">
            {isLoadingComments ? (
              <p role="status" className="text-sm text-slate-500 text-center py-6">
                Loading replies…
              </p>
            ) : activePost.comments.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-6">
                No replies yet. Be the first to share your thoughts.
              </p>
            ) : (
              activePost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] font-semibold text-xs flex items-center justify-center shrink-0">
                    {comment.authorInitials}
                  </div>
                  <div className="flex-1">
                        <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-1.5">
                      <div className="font-extrabold text-xs text-[#1A202C] mb-1 flex items-center gap-2">
                        <span>{comment.authorName}</span>
                        <span className="text-[10px] font-normal text-[#94A3B8]">
                          · {comment.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {view === 'feed' && (
        <header className="w-full space-y-5 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Users size={21} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Community</h1>
                <p className="text-sm text-slate-500 mt-0.5">Questions, ideas, and support from peers.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActionError('');
                setActionNotice('');
                setView('create');
              }}
              className="px-4 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Start a discussion</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search discussions"
              placeholder="Search discussions"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </header>
      )}

      {actionError && (
        <p role="alert" className="w-full rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </p>
      )}
      {actionNotice && (
        <p role="status" className="w-full rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {actionNotice}
        </p>
      )}

      {view === 'feed' && (
        <div className="w-full space-y-5">
          <section aria-label="Community overview" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center"><MessageSquare size={18} /></span>
              <div><p className="text-xl font-semibold text-slate-900">{posts.length}</p><p className="text-xs text-slate-500">Discussions</p></div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><Users size={18} /></span>
              <div><p className="text-xl font-semibold text-slate-900">148+</p><p className="text-xs text-slate-500">Active peers</p></div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><BookOpen size={18} /></span>
              <div><p className="text-xl font-semibold text-slate-900">3 active</p><p className="text-xs text-slate-500">Study groups</p></div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><CheckCircle2 size={18} /></span>
              <div><p className="text-xl font-semibold text-slate-900">{posts.filter((post) => post.authorName === user?.name).length || 'Active'}</p><p className="text-xs text-slate-500">Your activity</p></div>
            </div>
          </section>

          <div className="space-y-5">
            <div className="min-w-0">
              {renderFeed()}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="rounded-2xl bg-white border border-slate-200 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <BookOpen size={18} className="text-[#2563EB]" />
                  <h2 className="font-semibold text-slate-900">Active Study Groups</h2>
                  <span className="ml-auto text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    3 active
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-medium text-slate-800">
                      <span>Dyslexia Reading Sprints</span><span className="text-xs font-normal text-slate-500">24 peers</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Daily 20-minute focused phonics sessions</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-medium text-slate-800">
                      <span>Inclusive Career Prep</span><span className="text-xs font-normal text-slate-500">38 peers</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Resume reviews and interview practice</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-medium text-slate-800">
                      <span>Assistive Tools & Fonts</span><span className="text-xs font-normal text-slate-500">19 peers</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Text-to-speech workflows and visual guides</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-slate-200 p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <ShieldCheck size={18} className="text-[#2563EB]" />
                  <h2 className="font-semibold text-slate-900">Community Principles</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A kind, supportive, and accessible space. We encourage patience, constructive feedback,
                  and celebrating neurodivergent strengths.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-600">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  Inclusive and supportive
                </div>
              </section>
            </div>
          </div>

          <CommunityNetwork posts={posts} />
        </div>
      )}
      {view === 'create' && renderCreatePost()}
      {view === 'detail' && renderPostDetail()}
    </div>
  );
}
