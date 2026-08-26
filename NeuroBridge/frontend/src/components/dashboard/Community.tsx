import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  MessageSquare,
  Share2,
  ArrowLeft,
  Info,
  Users,
  Plus,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  ShieldCheck,
  Send,
  Radio,
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
}

// --- Default Data ---
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorName: 'Aarav Sharma',
    authorInitials: 'AS',
    timeAgo: '2h ago',
    title: 'How do you stay focused while studying?',
    content:
      'I find it difficult to read for long periods. What strategies have worked for you? I usually try to break my reading into smaller chunks, but sometimes I still lose track of where I am.',
    category: 'Study & Learning',
    likes: 12,
    comments: [
      {
        id: 'c1',
        authorName: 'Sarah Jenkins',
        authorInitials: 'SJ',
        timeAgo: '1h ago',
        content:
          'I use a physical ruler or a piece of paper to cover the lines below what I am currently reading. It stops my eyes from jumping around.',
      },
      {
        id: 'c2',
        authorName: 'Marcus T.',
        authorInitials: 'MT',
        timeAgo: '45m ago',
        content:
          'Text-to-speech is a game changer for me. Listening while reading along keeps me focused for much longer.',
      },
    ],
  },
  {
    id: '2',
    authorName: 'Elena Rostova',
    authorInitials: 'ER',
    timeAgo: '5h ago',
    title: 'Nervous about disclosing dyslexia in an interview',
    content:
      'I have an interview next week for a role I really want. Has anyone here disclosed their dyslexia during the interview process? Should I wait until I have an offer?',
    category: 'Career',
    likes: 34,
    comments: [],
  },
  {
    id: '3',
    authorName: 'David Chen',
    authorInitials: 'DC',
    timeAgo: '1d ago',
    title: 'Just discovered OpenDyslexic font',
    content:
      "Wow. I just turned on the dyslexic mode here and the font actually helps so much. The letters feel anchored to the line and don't float away. Does anyone use this everywhere? Can I install it on my computer for Word documents?",
    category: 'Experiences',
    likes: 56,
    comments: [
      {
        id: 'c3',
        authorName: 'Priya Patel',
        authorInitials: 'PP',
        timeAgo: '12h ago',
        content:
          'Yes! You can download it for free and install it on Windows and Mac. I use it for everything now.',
      },
    ],
  },
];

const CATEGORIES: Category[] = [
  'General',
  'Study & Learning',
  'Career',
  'Experiences',
  'Questions',
];

export function Community() {
  const { user, token } = useAuth();

  // State
  const [view, setView] = useState<'feed' | 'create' | 'detail'>('feed');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // Create Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Category>('General');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/api/community/posts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.posts && Array.isArray(data.posts)) setPosts(data.posts);
      })
      .catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!activePost || !token) return;
    fetch(`http://localhost:4000/api/community/posts/${activePost.id}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.comments) {
          setActivePost((current) =>
            current ? { ...current, comments: data.comments } : current
          );
        }
      })
      .catch(() => undefined);
  }, [activePost?.id, token]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      authorName: user?.name || 'Anonymous Learner',
      authorInitials: getInitials(user?.name || 'Anonymous'),
      timeAgo: 'Just now',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      comments: [],
    };

    if (token) {
      const response = await fetch('http://localhost:4000/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
        }),
      });
      const data = await response.json();
      if (response.ok && data.post) {
        setPosts((current) => [data.post, ...current]);
      } else {
        setPosts((current) => [newPost, ...current]);
      }
    } else {
      setPosts((current) => [newPost, ...current]);
    }

    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('General');
    setView('feed');
  };

  const handleAddComment = async () => {
    if (!activePost || !commentDraft.trim() || !token) return;
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
    if (!response.ok || !data.comment) return;
    const updated = { ...activePost, comments: [...activePost.comments, data.comment] };
    setActivePost(updated);
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
    setCommentDraft('');
  };

  const handleToggleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const isLiked = likedPostIds.has(postId);
    const newSet = new Set(likedPostIds);
    if (isLiked) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    setLikedPostIds(newSet);

    setPosts((current) =>
      current.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
        }
        return p;
      })
    );

    if (activePost && activePost.id === postId) {
      setActivePost((prev) =>
        prev ? { ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 } : prev
      );
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
      {/* Primary Column: Category Pills & Feed (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-[#1A202C] hover:border-blue-200 hover:text-[#2563EB]'
            }`}
          >
            All Topics ({posts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-[#1A202C] hover:border-blue-200 hover:text-[#2563EB]'
                }`}
              >
                {cat} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Posts Feed */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-blue-100/80 rounded-3xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-lg font-black text-[#1A202C] mb-1">No discussions found</h3>
            <p className="text-xs sm:text-sm text-[#64748B] mb-6">
              Be the first to start a conversation in this topic.
            </p>
            <button
              type="button"
              onClick={() => setView('create')}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Start a Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
                onClick={() => {
                  setActivePost(post);
                  setView('detail');
                }}
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-black text-xs text-[#2563EB] shrink-0 border border-blue-200 shadow-xs">
                      {post.authorInitials}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#1A202C] flex items-center gap-2">
                        <span>{post.authorName}</span>
                        <span className="text-[11px] font-semibold text-[#94A3B8]">
                          · {post.timeAgo}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-[#64748B]">
                        NeuroBridge Peer
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                      post.category
                    )}`}
                  >
                    {post.category}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-[#1A202C] group-hover:text-[#2563EB] transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-3 mb-5">
                  {post.content}
                </p>

                {/* Bottom Engagement Bar */}
                <div className="flex items-center gap-6 pt-3.5 border-t border-slate-100 text-xs font-bold text-[#64748B]">
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      likedPostIds.has(post.id)
                        ? 'text-red-500'
                        : 'hover:text-red-500 text-[#64748B]'
                    }`}
                    onClick={(e) => handleToggleLike(e, post.id)}
                  >
                    <Heart
                      size={16}
                      className={likedPostIds.has(post.id) ? 'fill-red-500 text-red-500' : ''}
                    />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-[#2563EB] transition-colors cursor-pointer text-[#64748B]"
                  >
                    <MessageSquare size={16} />
                    <span>{post.comments.length} Comments</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-[#2563EB] transition-colors cursor-pointer ml-auto text-[#94A3B8]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    title="Share discussion link"
                  >
                    <Share2 size={15} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Secondary Column: Study Circles, Peer Network & Guidelines (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Study Groups Card */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <h3 className="font-black text-sm text-[#1A202C]">Active Study Groups</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              3 Active
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A202C] mb-1">
                <span>Dyslexia Reading Sprints</span>
                <span className="text-[10px] text-[#2563EB] bg-blue-50 px-1.5 py-0.2 rounded">
                  24 Peers
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">Daily 20-min focused phonics sessions</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A202C] mb-1">
                <span>Inclusive Career Prep</span>
                <span className="text-[10px] text-[#2563EB] bg-blue-50 px-1.5 py-0.2 rounded">
                  38 Peers
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">Resume reviews & interview practice</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A202C] mb-1">
                <span>Assistive Tools & Fonts</span>
                <span className="text-[10px] text-[#2563EB] bg-blue-50 px-1.5 py-0.2 rounded">
                  19 Peers
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">TTS workflows & visual guides</p>
            </div>
          </div>
        </div>

        {/* Guidelines Card */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck size={18} className="text-[#2563EB]" />
            <h3 className="font-extrabold text-sm text-[#1A202C]">Community Principles</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed mb-3">
            A kind, supportive, and accessible space. We encourage patience, constructive feedback,
            and celebrating neurodivergent strengths.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Inclusive & Calibrated</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreatePost = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white border border-blue-100/80 rounded-3xl p-7 sm:p-9 shadow-xs"
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
            className="w-full sm:w-1/2 px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-sm text-[#1A202C] font-semibold outline-none transition-all"
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
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-sm text-[#1A202C] font-medium outline-none transition-all placeholder-[#94A3B8]"
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
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-sm text-[#1A202C] font-medium min-h-[220px] leading-relaxed resize-y outline-none transition-all placeholder-[#94A3B8]"
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
            disabled={!newPostTitle.trim() || !newPostContent.trim()}
            className="px-7 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            Publish Discussion
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
        <div className="bg-white border border-blue-100/80 rounded-3xl p-7 sm:p-9 shadow-xs">
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
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                likedPostIds.has(activePost.id)
                  ? 'text-red-500'
                  : 'hover:text-red-500 text-[#64748B]'
              }`}
              onClick={(e) => handleToggleLike(e, activePost.id)}
            >
              <Heart
                size={18}
                className={likedPostIds.has(activePost.id) ? 'fill-red-500 text-red-500' : ''}
              />
              <span>{activePost.likes} Likes</span>
            </button>

            <div className="flex items-center gap-1.5 text-[#64748B]">
              <MessageSquare size={18} />
              <span>{activePost.comments.length} Responses</span>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-[#2563EB] transition-colors cursor-pointer ml-auto text-[#94A3B8]"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-blue-100/80 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <h3 className="text-lg font-black text-[#1A202C]">
            Responses ({activePost.comments.length})
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
            {activePost.comments.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-6">
                No replies yet. Be the first to share your thoughts.
              </p>
            ) : (
              activePost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                    {comment.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 mb-1.5">
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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* ─── 1. COMMUNITY HEADER ────────────────────────────────────────── */}
      {view !== 'detail' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] p-2.5 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Users size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">Community</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Radio size={11} className="text-emerald-500 animate-pulse" /> Live Forum
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium truncate">
                Connect, learn, and grow with the NeuroBridge peer community.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {view === 'feed' && (
              <div className="relative min-w-[220px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-[#1A202C] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-all"
                />
              </div>
            )}

            {view === 'feed' && (
              <button
                type="button"
                onClick={() => setView('create')}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>Start a Discussion</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── 2. COMMUNITY OVERVIEW (METRICS) ────────────────────────────── */}
      {view === 'feed' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="text-xl font-black text-[#1A202C]">{posts.length}</div>
              <div className="text-[11px] font-bold text-[#64748B]">Discussions</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xl font-black text-[#1A202C]">148+</div>
              <div className="text-[11px] font-bold text-[#64748B]">Active Peers</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="text-xl font-black text-[#1A202C]">3 Active</div>
              <div className="text-[11px] font-bold text-[#64748B]">Study Groups</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#E86F51] flex items-center justify-center shrink-0 border border-orange-100">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-xl font-black text-[#1A202C]">
                {posts.filter((p) => p.authorName === user?.name).length > 0
                  ? `${posts.filter((p) => p.authorName === user?.name).length} Posts`
                  : 'Active'}
              </div>
              <div className="text-[11px] font-bold text-[#64748B]">Your Activity</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. PEER NETWORK DISCOVERY COMPONENT ────────────────────────── */}
      {view === 'feed' && <CommunityNetwork posts={posts} />}

      {/* ─── 4. MAIN CONTENT ROUTER (FEED / CREATE / DETAIL) ────────────── */}
      {view === 'feed' && renderFeed()}
      {view === 'create' && renderCreatePost()}
      {view === 'detail' && renderPostDetail()}
    </div>
  );
}
