import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, MessageSquare, Share2, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

// --- Mock Data ---
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorName: 'Aarav Sharma',
    authorInitials: 'AS',
    timeAgo: '2h ago',
    title: 'How do you stay focused while studying?',
    content: 'I find it difficult to read for long periods. What strategies have worked for you? I usually try to break my reading into smaller chunks, but sometimes I still lose track of where I am.',
    category: 'Study & Learning',
    likes: 12,
    comments: [
      {
        id: 'c1',
        authorName: 'Sarah Jenkins',
        authorInitials: 'SJ',
        timeAgo: '1h ago',
        content: 'I use a physical ruler or a piece of paper to cover the lines below what I am currently reading. It stops my eyes from jumping around.'
      },
      {
        id: 'c2',
        authorName: 'Marcus T.',
        authorInitials: 'MT',
        timeAgo: '45m ago',
        content: 'Text-to-speech is a game changer for me. Listening while reading along keeps me focused for much longer.'
      }
    ]
  },
  {
    id: '2',
    authorName: 'Elena Rostova',
    authorInitials: 'ER',
    timeAgo: '5h ago',
    title: 'Nervous about disclosing dyslexia in an interview',
    content: 'I have an interview next week for a role I really want. Has anyone here disclosed their dyslexia during the interview process? Should I wait until I have an offer?',
    category: 'Career',
    likes: 34,
    comments: []
  },
  {
    id: '3',
    authorName: 'David Chen',
    authorInitials: 'DC',
    timeAgo: '1d ago',
    title: 'Just discovered OpenDyslexic font',
    content: 'Wow. I just turned on the dyslexic mode here and the font actually helps so much. The letters feel anchored to the line and don\'t float away. Does anyone use this everywhere? Can I install it on my computer for Word documents?',
    category: 'Experiences',
    likes: 56,
    comments: [
      {
        id: 'c3',
        authorName: 'Priya Patel',
        authorInitials: 'PP',
        timeAgo: '12h ago',
        content: 'Yes! You can download it for free and install it on Windows and Mac. I use it for everything now.'
      }
    ]
  }
];

const CATEGORIES: Category[] = ['General', 'Study & Learning', 'Career', 'Experiences', 'Questions'];

export function Community() {
  const { user } = useAuth();
  
  // State
  const [view, setView] = useState<'feed' | 'create' | 'detail'>('feed');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<Post | null>(null);

  // Create Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Category>('General');

  // Helpers
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      authorName: user?.name || 'Anonymous User',
      authorInitials: getInitials(user?.name || 'Anonymous'),
      timeAgo: 'Just now',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('General');
    setView('feed');
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Views ---

  const renderFeed = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Column: Guidelines & Categories */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Guidelines Card */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <Info size={18} className="text-text-muted mt-0.5 shrink-0" />
            <h3 className="font-bold text-text text-base">A kind space for everyone</h3>
          </div>
          <p className="text-sm text-text mb-3 leading-relaxed">
            Be respectful, share your experiences, and support others. 
          </p>
          <button className="text-sm font-bold text-text underline decoration-2 underline-offset-4 hover:text-[#4A90E2] transition-colors">
            View Community Guidelines
          </button>
        </div>

        {/* Categories */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-text text-base mb-4">Categories</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                selectedCategory === 'All' ? 'bg-[#4A90E2] text-white' : 'text-text hover:bg-gray-100'
              }`}
            >
              All Posts
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  selectedCategory === cat ? 'bg-[#4A90E2] text-white' : 'text-text hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Feed */}
      <div className="lg:col-span-3 space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-sm">
            <p className="text-lg font-bold text-text mb-2">Nothing here yet</p>
            <p className="text-text-muted mb-6">Be the first to start a conversation in this category.</p>
            <button 
              onClick={() => setView('create')}
              className="px-6 py-3 bg-[#4A90E2] hover:bg-[#3A80D2] text-white rounded-lg font-bold transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setActivePost(post); setView('detail'); }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#4A90E2] shrink-0 border border-blue-50">
                  {post.authorInitials}
                </div>
                <div>
                  <div className="font-bold text-text flex items-center gap-2">
                    {post.authorName} <span className="text-text-muted text-sm font-normal">· {post.timeAgo}</span>
                  </div>
                  <div className="text-xs font-bold text-text-muted mt-0.5">{post.category}</div>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-text mb-3 leading-snug">{post.title}</h2>
              <p className="text-text leading-relaxed line-clamp-3 mb-6">
                {post.content}
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-text hover:text-text transition-opacity opacity-70 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                  <Heart size={18} />
                  <span className="text-sm font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-text hover:text-text transition-opacity opacity-70 hover:opacity-100">
                  <MessageSquare size={18} />
                  <span className="text-sm font-bold">{post.comments.length}</span>
                </button>
                <button className="flex items-center gap-2 text-text hover:text-text transition-opacity opacity-70 hover:opacity-100 ml-auto" onClick={(e) => e.stopPropagation()}>
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderCreatePost = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-8 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Create a Post</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-text mb-2">Category</label>
          <select 
            value={newPostCategory}
            onChange={(e) => setNewPostCategory(e.target.value as Category)}
            className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-border focus:border-[#4A90E2] focus:outline-none bg-white text-text  "
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-text mb-2">Post Title</label>
          <input 
            type="text" 
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="What would you like to discuss?"
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-[#4A90E2] focus:outline-none bg-white text-text  "
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-text mb-2">Your Post</label>
          <textarea 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your thoughts, question, experience, or advice..."
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-[#4A90E2] focus:outline-none bg-white text-text   min-h-[250px] leading-relaxed resize-y"
          />
        </div>

        <div className="flex items-center gap-4 justify-end pt-4 border-t border-gray-100">
          <button 
            onClick={() => setView('feed')}
            className="px-6 py-3 font-bold text-text hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreatePost}
            disabled={!newPostTitle.trim() || !newPostContent.trim()}
            className="px-8 py-3 bg-[#4A90E2] hover:bg-[#3A80D2] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
          >
            Publish Post
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
        className="max-w-3xl mx-auto"
      >
        <button 
          onClick={() => { setView('feed'); setActivePost(null); }}
          className="flex items-center gap-2 text-text font-bold hover:text-[#4A90E2] transition-colors mb-6"
        >
          <ArrowLeft size={20} /> Back to Community
        </button>

        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#4A90E2] shrink-0 border border-blue-50 text-lg">
              {activePost.authorInitials}
            </div>
            <div>
              <div className="font-bold text-text text-lg flex items-center gap-2">
                {activePost.authorName} <span className="text-text-muted text-sm font-normal">· {activePost.timeAgo}</span>
              </div>
              <div className="text-sm font-bold text-text-muted mt-0.5">{activePost.category}</div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-text mb-6 leading-snug">{activePost.title}</h1>
          <div className="text-text leading-relaxed whitespace-pre-wrap mb-8 text-lg">
            {activePost.content}
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
            <button className="flex items-center gap-2 text-text hover:text-text transition-opacity opacity-70 hover:opacity-100">
              <Heart size={20} />
              <span className="font-bold">{activePost.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-text transition-opacity opacity-70 cursor-default">
              <MessageSquare size={20} />
              <span className="font-bold">{activePost.comments.length}</span>
            </button>
            <button className="flex items-center gap-2 text-text hover:text-text transition-opacity opacity-70 hover:opacity-100 ml-auto">
              <Share2 size={20} /> Share
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-text mb-6">Comments ({activePost.comments.length})</h3>
          
          {/* Add comment input mockup */}
          <div className="flex gap-4 mb-10">
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">
               {getInitials(user?.name || 'You')}
             </div>
             <input 
               type="text" 
               placeholder="Write a comment..."
               className="flex-1 px-4 py-2.5 rounded-lg border border-border focus:border-[#4A90E2] focus:outline-none bg-gray-50 text-text  "
             />
          </div>

          <div className="space-y-8">
            {activePost.comments.length === 0 ? (
              <p className="text-text-muted text-center py-4">No comments yet. Be the first to share your thoughts.</p>
            ) : (
              activePost.comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#4A90E2] shrink-0 border border-blue-50">
                    {comment.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-2">
                      <div className="font-bold text-text mb-1 flex items-center gap-2">
                        {comment.authorName} <span className="text-text-muted text-xs font-normal">· {comment.timeAgo}</span>
                      </div>
                      <p className="text-text leading-relaxed text-sm">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 px-2">
                      <button className="text-xs font-bold text-text-muted hover:text-[#4A90E2] transition-colors">Like</button>
                      <button className="text-xs font-bold text-text-muted hover:text-[#4A90E2] transition-colors">Reply</button>
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
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      {/* Universal Header - Only shown when not in detail view to save space, but keeping search is good */}
      {view !== 'detail' && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Community</h1>
            <p className="text-text  ">Connect, share, learn, and support each other.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {view === 'feed' && (
              <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search discussions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-[#4A90E2] focus:outline-none bg-white text-text  "
                />
              </div>
            )}
            
            {view === 'feed' && (
              <button 
                onClick={() => setView('create')}
                className="w-full sm:w-auto px-6 py-3 bg-[#4A90E2] hover:bg-[#3A80D2] text-white rounded-lg font-bold transition-colors shrink-0 shadow-sm"
              >
                Create Post
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Router */}
      {view === 'feed' && renderFeed()}
      {view === 'create' && renderCreatePost()}
      {view === 'detail' && renderPostDetail()}

    </div>
  );
}
