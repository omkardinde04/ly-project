import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Send,
  Heart,
  Share2,
  Plus,
  Search,
  Check,
  X,
  UserPlus,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  MessageCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config/api';

// ─── TYPES ──────────────────────────────────────────────────────────────────
export type Category = 'General' | 'Study & Learning' | 'Career' | 'Experiences' | 'Questions';

export interface Comment {
  id: string;
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  content: string;
}

export interface Post {
  id: string;
  authorId?: string;
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

export interface Person {
  id: string;
  name: string;
  profilePicture?: string;
  classification?: string;
  connectionStatus: 'none' | 'pending' | 'incoming' | 'connected' | 'declined';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

const CATEGORIES: { label: Category; icon: string; desc: string }[] = [
  { label: 'General', icon: '💬', desc: 'General thoughts & open chat' },
  { label: 'Study & Learning', icon: '💡', desc: 'Techniques, tools & strategies' },
  { label: 'Career', icon: '🚀', desc: 'Jobs, interviews & skills' },
  { label: 'Experiences', icon: '🧠', desc: 'Personal neurodiversity stories' },
  { label: 'Questions', icon: '❓', desc: 'Ask peers for advice & tips' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Community() {
  const { user, token } = useAuth();
  const currentUserId = user?.id ? String(user.id) : '';

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<'discussions' | 'network' | 'messages'>('discussions');

  // ─── DISCUSSIONS STATE ───────────────────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Start Discussion modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('General');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [composerError, setComposerError] = useState('');

  // Expanded comments by postId
  const [expandedPostComments, setExpandedPostComments] = useState<Record<string, Comment[]>>({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<string | null>(null);

  // Copied share state
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // ─── NETWORK / CONNECTIONS STATE ───────────────────────────────────────────
  const [people, setPeople] = useState<Person[]>([]);
  const [connections, setConnections] = useState<Person[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Person[]>([]);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);
  const [networkSearch, setNetworkSearch] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // ─── CHAT / MESSAGES STATE ─────────────────────────────────────────────────
  const [selectedFriend, setSelectedFriend] = useState<Person | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── 1. LOAD DISCUSSIONS ───────────────────────────────────────────────────
  const fetchPosts = async () => {
    if (!token) return;
    try {
      setIsLoadingPosts(true);
      const res = await fetch(`${API_BASE}/api/community/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load community discussions');
      const data = await res.json();
      setPosts(data.posts || []);
      setPostsError('');
    } catch (err: any) {
      setPostsError(err.message || 'Error loading discussions');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // ─── 2. LOAD NETWORK & CONNECTIONS ─────────────────────────────────────────
  const fetchNetwork = async () => {
    if (!token) return;
    try {
      setIsLoadingNetwork(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [peopleRes, connRes, inboxRes] = await Promise.all([
        fetch(`${API_BASE}/api/community/people`, { headers }),
        fetch(`${API_BASE}/api/community/connections`, { headers }),
        fetch(`${API_BASE}/api/community/inbox`, { headers }),
      ]);

      if (peopleRes.ok) {
        const pData = await peopleRes.json();
        setPeople(pData.people || []);
      }
      if (connRes.ok) {
        const cData = await connRes.json();
        setConnections(cData.connections || []);
      }
      if (inboxRes.ok) {
        const iData = await inboxRes.json();
        setIncomingRequests(iData.requests || []);
      }
    } catch (err) {
      console.warn('Network sync error:', err);
    } finally {
      setIsLoadingNetwork(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchNetwork();
  }, [token]);

  // Map to easily look up connection status by person ID
  const connectionStatusMap = useMemo(() => {
    const map = new Map<string, 'none' | 'pending' | 'incoming' | 'connected' | 'declined'>();
    people.forEach((p) => {
      map.set(p.id, p.connectionStatus);
    });
    connections.forEach((c) => {
      map.set(c.id, 'connected');
    });
    incomingRequests.forEach((r) => {
      map.set(r.id, 'incoming');
    });
    return map;
  }, [people, connections, incomingRequests]);

  // ─── 3. CREATE DISCUSSION ──────────────────────────────────────────────────
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const title = newTitle.trim();
    const content = newContent.trim();
    if (!title || !content) {
      setComposerError('Please provide both a title and details for your discussion.');
      return;
    }

    setIsSubmittingPost(true);
    setComposerError('');
    try {
      const res = await fetch(`${API_BASE}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          category: newCategory,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create discussion');
      }

      const data = await res.json();
      if (data.post) {
        setPosts((prev) => [data.post, ...prev]);
      }
      setNewTitle('');
      setNewContent('');
      setNewCategory('General');
      setIsComposerOpen(false);
    } catch (err: any) {
      setComposerError(err.message || 'Could not post discussion');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // ─── 4. LIKE / UNLIKE POST ─────────────────────────────────────────────────
  const handleToggleLike = async (post: Post) => {
    if (!token) return;
    const action = post.likedByMe ? 'unlike' : 'like';

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likedByMe: !post.likedByMe,
              likes: post.likedByMe ? Math.max(0, p.likes - 1) : p.likes + 1,
            }
          : p
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/community/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  likes: data.likes,
                  likedByMe: data.likedByMe,
                }
              : p
          )
        );
      }
    } catch {}
  };

  // ─── 5. COMMENTS TOGGLE & FETCH ────────────────────────────────────────────
  const toggleComments = async (postId: string) => {
    if (expandedPostComments[postId]) {
      // Collapse
      const next = { ...expandedPostComments };
      delete next[postId];
      setExpandedPostComments(next);
      return;
    }

    if (!token) return;
    setLoadingCommentsPostId(postId);
    try {
      const res = await fetch(`${API_BASE}/api/community/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpandedPostComments((prev) => ({
          ...prev,
          [postId]: data.comments || [],
        }));
      }
    } catch (err) {
      console.warn('Error loading comments:', err);
    } finally {
      setLoadingCommentsPostId(null);
    }
  };

  const handleAddComment = async (postId: string) => {
    const draft = (commentDrafts[postId] || '').trim();
    if (!draft || !token) return;

    setIsSubmittingComment(postId);
    try {
      const res = await fetch(`${API_BASE}/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: draft }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setExpandedPostComments((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), data.comment],
          }));
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
          );
          setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
        }
      }
    } catch (err) {
      console.warn('Error adding comment:', err);
    } finally {
      setIsSubmittingComment(null);
    }
  };

  // ─── 6. CONNECTION ACTIONS (LINKEDIN-STYLE) ────────────────────────────────
  const handleConnectAction = async (
    targetId: string,
    action: 'request' | 'accept' | 'decline' | 'disconnect'
  ) => {
    if (!token) return;
    setConnectingId(targetId);
    try {
      const res = await fetch(`${API_BASE}/api/community/connect/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // Refresh network state
        await fetchNetwork();
      }
    } catch (err) {
      console.error('Connection action error:', err);
    } finally {
      setConnectingId(null);
    }
  };

  // ─── 7. CHAT LOGIC (ONLY MUTUAL FRIENDS) ──────────────────────────────────
  const startChatWithFriend = (friend: Person) => {
    setSelectedFriend(friend);
    setActiveTab('messages');
    fetchChat(friend.id);
  };

  const fetchChat = async (friendId: string) => {
    if (!token) return;
    setIsLoadingMessages(true);
    setChatError('');
    try {
      const res = await fetch(`${API_BASE}/api/community/messages/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      } else {
        const err = await res.json();
        setChatError(err.error || 'Could not load chat messages.');
      }
    } catch (err: any) {
      setChatError(err.message || 'Error loading chat');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFriend || !token) return;
    const text = messageDraft.trim();
    if (!text) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch(`${API_BASE}/api/community/messages/${selectedFriend.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setChatMessages((prev) => [...prev, data.message]);
          setMessageDraft('');
        }
      } else {
        const err = await res.json();
        setChatError(err.error || 'Could not send message');
      }
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === 'messages' && selectedFriend) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, selectedFriend]);

  // Periodic polling for messages when active in chat
  useEffect(() => {
    if (activeTab !== 'messages' || !selectedFriend || !token) return;
    const interval = setInterval(() => {
      fetch(`${API_BASE}/api/community/messages/${selectedFriend.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.messages) {
            setChatMessages(data.messages);
          }
        })
        .catch(() => {});
    }, 4500);

    return () => clearInterval(interval);
  }, [activeTab, selectedFriend, token]);

  // ─── FILTERED DATA ─────────────────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCat = selectedCategory === 'All' || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const filteredPeople = useMemo(() => {
    const q = networkSearch.toLowerCase().trim();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.classification && p.classification.toLowerCase().includes(q))
    );
  }, [people, networkSearch]);

  const copyShareLink = (postId: string) => {
    const url = `${window.location.origin}/dashboard?tab=community&communityPost=${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16 animate-in fade-in duration-200">
      {/* ─── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#2563EB] border border-blue-100">
            <Sparkles size={13} />
            <span>Inclusive Study Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] tracking-tight">
            Community Hub
          </h1>
          <p className="text-sm font-medium text-[#64748B]">
            Start discussions, connect with classmates, and chat 1-on-1 with mutual friends.
          </p>
        </div>

        {/* 3 Unified Tabs */}
        <div className="flex items-center p-1.5 bg-[#F1F5F9] rounded-2xl gap-1.5 border border-slate-200/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('discussions')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'discussions'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#1A202C]'
            }`}
          >
            <MessageSquare size={16} />
            <span>Discussions</span>
            {posts.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-black">
                {posts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'network'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#1A202C]'
            }`}
          >
            <Users size={16} />
            <span>My Network</span>
            {incomingRequests.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('messages');
              if (!selectedFriend && connections.length > 0) {
                setSelectedFriend(connections[0]);
                fetchChat(connections[0].id);
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#1A202C]'
            }`}
          >
            <Send size={15} />
            <span>Messages</span>
            {connections.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                {connections.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── TAB 1: DISCUSSIONS ──────────────────────────────────────────────── */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Controls Bar: Search + Category Filter + New Post Button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search discussions by topic or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-[#1A202C] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            {/* "+ Start Discussion" Button */}
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Start Discussion</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#1A202C] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Topics
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.label
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white text-[#64748B] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Discussions Feed List */}
          {isLoadingPosts ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <RefreshCw size={24} className="animate-spin text-[#2563EB] mx-auto" />
              <p className="text-sm font-semibold text-[#64748B]">Loading community feed...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-2xl mx-auto">
                💬
              </div>
              <h3 className="text-lg font-black text-[#1A202C]">No discussions found</h3>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or category filter.'
                  : 'Be the first learner to start a discussion! Ask a question or share a technique.'}
              </p>
              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="px-5 py-2.5 bg-[#2563EB] text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                + Start First Discussion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const isAuthorMe = post.authorId && post.authorId === currentUserId;
                const authorStatus = post.authorId ? connectionStatusMap.get(post.authorId) : 'none';
                const comments = expandedPostComments[post.id];
                const isCommentsOpen = !!comments;

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all space-y-4"
                  >
                    {/* Author & Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-black text-sm flex items-center justify-center border border-blue-200/80 shadow-xs shrink-0">
                          {post.authorInitials || getInitials(post.authorName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-[#1A202C]">
                              {post.authorName}
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-400">· {post.timeAgo}</span>
                          </div>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/60 mt-0.5">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Connect Button on Post Author (LinkedIn style) */}
                      {!isAuthorMe && post.authorId && (
                        <div>
                          {authorStatus === 'connected' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const friend = connections.find((c) => c.id === post.authorId);
                                if (friend) startChatWithFriend(friend);
                                else {
                                  setActiveTab('network');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Chat with mutual friend"
                            >
                              <UserCheck size={13} />
                              <span>Friend · Chat</span>
                            </button>
                          ) : authorStatus === 'pending' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                              ⏳ Requested
                            </span>
                          ) : authorStatus === 'incoming' ? (
                            <button
                              type="button"
                              onClick={() => handleConnectAction(post.authorId!, 'accept')}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Accept Request
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConnectAction(post.authorId!, 'request')}
                              disabled={connectingId === post.authorId}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold border border-blue-200/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <UserPlus size={13} />
                              <span>Connect</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-black text-[#1A202C] leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            post.likedByMe
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-[#64748B]'
                          }`}
                        >
                          <Heart
                            size={14}
                            className={post.likedByMe ? 'fill-rose-500 text-rose-500' : ''}
                          />
                          <span>{post.likes}</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleComments(post.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCommentsOpen
                              ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-[#64748B]'
                          }`}
                        >
                          <MessageCircle size={14} />
                          <span>{post.commentCount} Comments</span>
                          {isCommentsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => copyShareLink(post.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Copy discussion link"
                      >
                        {copiedPostId === post.id ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check size={13} /> Copied
                          </span>
                        ) : (
                          <Share2 size={15} />
                        )}
                      </button>
                    </div>

                    {/* Inline Comments Section */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {loadingCommentsPostId === post.id ? (
                          <p className="text-xs text-slate-400 text-center py-2">
                            Loading replies...
                          </p>
                        ) : comments && comments.length > 0 ? (
                          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {comments.map((c) => (
                              <div
                                key={c.id}
                                className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between font-extrabold text-[#1A202C]">
                                  <span>{c.authorName}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {c.timeAgo}
                                  </span>
                                </div>
                                <p className="text-[#475569] font-medium leading-relaxed">
                                  {c.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-1">
                            No comments yet. Be the first to share your perspective!
                          </p>
                        )}

                        {/* Comment Input */}
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write a supportive reply..."
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts({
                                ...commentDrafts,
                                [post.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            className="flex-1 px-3.5 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white text-[#1A202C]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            disabled={
                              isSubmittingComment === post.id || !commentDrafts[post.id]?.trim()
                            }
                            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Send size={12} />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: MY NETWORK (LINKEDIN-STYLE CONNECTIONS) ──────────────────── */}
      {activeTab === 'network' && (
        <div className="space-y-7">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-xl">
                {connections.length}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1A202C]">Mutual Friends</h4>
                <p className="text-xs text-[#64748B] font-medium">Unlocked 1-on-1 Chat</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-black text-xl">
                {incomingRequests.length}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1A202C]">Pending Invites</h4>
                <p className="text-xs text-[#64748B] font-medium">Awaiting your approval</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center font-black text-xl">
                {people.length}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1A202C]">Learners in Network</h4>
                <p className="text-xs text-[#64748B] font-medium">Ready to connect</p>
              </div>
            </div>
          </div>

          {/* SECTION 1: INCOMING INVITATIONS */}
          {incomingRequests.length > 0 && (
            <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#1A202C]">
                  Invitations ({incomingRequests.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] font-black text-xs flex items-center justify-center shrink-0">
                        {getInitials(req.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1A202C] truncate">
                          {req.name}
                        </h4>
                        {req.classification && (
                          <p className="text-[11px] text-[#64748B] font-medium truncate">
                            {req.classification}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleConnectAction(req.id, 'accept')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Check size={12} strokeWidth={3} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConnectAction(req.id, 'decline')}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                        title="Decline"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: MY CONNECTED FRIENDS (CAN CHAT!) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#1A202C]">
                  My Friends ({connections.length})
                </h3>
                <p className="text-xs text-[#64748B] font-medium">
                  You and these peers mutually accepted connection requests. You can chat anytime!
                </p>
              </div>
            </div>

            {connections.length === 0 ? (
              <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center border border-slate-100 space-y-2">
                <p className="text-sm font-bold text-[#1A202C]">No friends connected yet</p>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Send connection requests to peers below. Once they accept, they will appear here and you can chat 1-on-1!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-blue-100/80 hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200/80 shrink-0">
                        {getInitials(friend.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1A202C] truncate group-hover:text-[#2563EB] transition-colors">
                          {friend.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                          <Check size={10} strokeWidth={3} /> Connected
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startChatWithFriend(friend)}
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <MessageCircle size={13} />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: DISCOVER OTHER LEARNERS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#1A202C]">
                  Discover Peers
                </h3>
                <p className="text-xs text-[#64748B] font-medium">
                  Connect with classmates and fellow learners across NeuroBridge.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Find by name..."
                  value={networkSearch}
                  onChange={(e) => setNetworkSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeople.map((person) => {
                const status = connectionStatusMap.get(person.id) || 'none';
                return (
                  <div
                    key={person.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-black text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
                        {getInitials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1A202C] truncate">
                          {person.name}
                        </h4>
                        {person.classification ? (
                          <p className="text-[11px] text-[#64748B] font-medium truncate">
                            {person.classification}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 font-medium">Student Learner</p>
                        )}
                      </div>
                    </div>

                    {/* Connection Button */}
                    <div>
                      {status === 'connected' ? (
                        <button
                          type="button"
                          onClick={() => startChatWithFriend(person)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle size={12} />
                          <span>Chat</span>
                        </button>
                      ) : status === 'pending' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                          ⏳ Sent
                        </span>
                      ) : status === 'incoming' ? (
                        <button
                          type="button"
                          onClick={() => handleConnectAction(person.id, 'accept')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnectAction(person.id, 'request')}
                          disabled={connectingId === person.id}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus size={12} />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MESSAGES (ONLY MUTUAL FRIENDS) ───────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-blue-100/80 shadow-xs overflow-hidden">
          {connections.length === 0 ? (
            /* Friendly gatekeeper state: only friends can chat */
            <div className="p-12 sm:p-16 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-3xl mx-auto shadow-xs border border-blue-100">
                🔒
              </div>
              <h3 className="text-xl font-black text-[#1A202C]">Friend-Only Direct Chat</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                To keep this space safe, calm, and distraction-free, 1-on-1 chat unlocks only after both learners have accepted a connection request (like LinkedIn).
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('network')}
                  className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Users size={16} />
                  <span>Go to My Network & Connect</span>
                </button>
              </div>
            </div>
          ) : (
            /* Two-column chat interface */
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
              {/* Left Column: Friends List */}
              <div className="md:col-span-4 border-r border-slate-100 bg-[#F8FAFC]/50 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <h4 className="font-black text-sm text-[#1A202C]">Connected Friends</h4>
                  <p className="text-[11px] text-[#64748B]">Select a peer to chat</p>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {connections.map((friend) => {
                    const isSelected = selectedFriend?.id === friend.id;
                    return (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => {
                          setSelectedFriend(friend);
                          fetchChat(friend.id);
                        }}
                        className={`w-full p-4 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-r-3 border-[#2563EB]'
                            : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-black text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
                          {getInitials(friend.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-xs sm:text-sm text-[#1A202C] truncate">
                            {friend.name}
                          </h5>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Connected
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Chat Area */}
              <div className="md:col-span-8 flex flex-col bg-white">
                {selectedFriend ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-black text-xs flex items-center justify-center border border-blue-200">
                          {getInitials(selectedFriend.name)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#1A202C]">
                            {selectedFriend.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {selectedFriend.classification || 'Mutual Connection'} · Private 1-on-1
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        ✓ Mutual Friend
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[350px] max-h-[440px] bg-[#FAFBFD]">
                      {isLoadingMessages ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Loading conversation...
                        </div>
                      ) : chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <div className="text-3xl">👋</div>
                          <h5 className="text-xs sm:text-sm font-extrabold text-[#1A202C]">
                            Say hello to {selectedFriend.name}!
                          </h5>
                          <p className="text-xs text-[#64748B] max-w-xs">
                            You both accepted connection requests. You can discuss assignments, strategies, or study together.
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isMe = msg.senderId === currentUserId;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                                  isMe
                                    ? 'bg-[#2563EB] text-white rounded-br-xs font-medium'
                                    : 'bg-white border border-slate-200 text-[#1A202C] rounded-bl-xs font-medium'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-slate-400 mt-1 px-1 font-semibold">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer Bar */}
                    {chatError && (
                      <div className="px-4 py-1.5 bg-rose-50 border-t border-rose-100 text-rose-600 text-[11px] font-semibold">
                        {chatError}
                      </div>
                    )}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="text"
                        placeholder={`Message ${selectedFriend.name}... (Press Enter)`}
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white text-[#1A202C]"
                      />
                      <button
                        type="submit"
                        disabled={isSendingMessage || !messageDraft.trim()}
                        className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Send size={14} />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <MessageSquare size={32} className="mb-2 opacity-40" />
                    <p className="text-xs sm:text-sm font-medium">Select a friend on the left to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── START DISCUSSION MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {isComposerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-100 z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    💬
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1A202C]">Start a Discussion</h3>
                    <p className="text-xs text-[#64748B]">Share insights, questions, or helpful tools.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="p-2 text-slate-400 hover:text-[#1A202C] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {composerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {composerError}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#1A202C] mb-2">
                    Topic Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setNewCategory(cat.label)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          newCategory === cat.label
                            ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                            : 'bg-white border-slate-200 text-[#475569] hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-sm mb-0.5">{cat.icon}</div>
                        <div>{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#1A202C] mb-1.5">
                    Discussion Title
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    placeholder="e.g., What reading font or background color reduces fatigue for you?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#1A202C]"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-[#1A202C] mb-1.5">
                    Details & Context
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Share what works for you, ask questions, or describe your routine..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#1A202C] resize-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPost || !newTitle.trim() || !newContent.trim()}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingPost ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Publish Discussion</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
