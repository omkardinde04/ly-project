import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  MessageCircle,
  Send,
  UserPlus,
  Users,
  X,
  ArrowLeft,
  Mail,
  UserCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type Person = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  classification?: string;
  connectionStatus: 'none' | 'pending' | 'incoming' | 'connected' | 'declined';
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type InboxMessage = {
  id: string;
  sender?: Person;
  text: string;
  createdAt: string;
};

export type NetworkPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  title: string;
  content: string;
  category: string;
  timeAgo: string;
};

const API = 'http://localhost:4000/api/community';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function CommunityNetwork({ posts = [] }: { posts?: NetworkPost[] }) {
  const { token, user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [connections, setConnections] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [profile, setProfile] = useState<Person | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inboxRequests, setInboxRequests] = useState<Person[]>([]);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [tab, setTab] = useState<'discover' | 'network' | 'inbox'>('discover');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [inboxLoaded, setInboxLoaded] = useState(false);

  const load = () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/people`, { headers }).then((r) => r.json()),
      fetch(`${API}/connections`, { headers }).then((r) => r.json()),
      fetch(`${API}/inbox`, { headers }).then((r) => r.json()),
    ])
      .then(([peopleData, connectionData, inboxData]) => {
        const nextMessages = inboxData.messages || [];
        if (inboxLoaded) {
          const newMessage = nextMessages.find(
            (message: InboxMessage) => !inboxMessages.some((existing) => existing.id === message.id)
          );
          if (newMessage?.sender) {
            setNotification(`You have a message from ${newMessage.sender.name}`);
          }
        }
        setInboxLoaded(true);
        setPeople(peopleData.people || []);
        setConnections(connectionData.connections || []);
        setInboxRequests(inboxData.requests || []);
        setInboxMessages(nextMessages);
      })
      .catch(() => setError('Could not load your community network.'));
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [token, inboxLoaded, inboxMessages]);

  useEffect(() => {
    if (!notification) return;
    const toast = document.createElement('div');
    toast.className =
      'fixed right-5 top-5 z-[90] rounded-2xl border border-blue-200 bg-white p-4 text-xs font-black text-[#1A202C] shadow-2xl animate-in fade-in slide-in-from-top-2';
    toast.textContent = notification;
    document.body.appendChild(toast);
    const timer = window.setTimeout(() => toast.remove(), 6000);
    return () => {
      window.clearTimeout(timer);
      toast.remove();
    };
  }, [notification]);

  useEffect(() => {
    if (!selected || !token) return;
    const fetchMessages = () =>
      fetch(`${API}/messages/${selected.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          setMessages(data.messages || []);
          if (data.participant?.name && data.participant.name !== selected.name) {
            setSelected((current) =>
              current
                ? {
                    ...current,
                    name: data.participant.name,
                    profilePicture: data.participant.profilePicture,
                    classification: data.participant.classification,
                  }
                : current
            );
          }
        })
        .catch(() => undefined);
    fetchMessages();
    const timer = window.setInterval(fetchMessages, 2000);
    return () => window.clearInterval(timer);
  }, [selected?.id, token, selected?.name]);

  const connect = (person: Person, action = 'request') => {
    if (!token) return;
    fetch(`${API}/connect/${person.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action }),
    })
      .then((r) => r.json())
      .then(() => load())
      .catch(() => setError('Could not update this connection.'));
  };

  const send = () => {
    if (!selected || selected.connectionStatus !== 'connected' || !draft.trim() || !token) return;
    const text = draft.trim();
    setDraft('');
    fetch(`${API}/messages/${selected.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message) setMessages((current) => [...current, data.message]);
      })
      .catch(() => setError('Could not send message.'));
  };

  if (profile) {
    return <ProfileView person={profile} posts={posts} onBack={() => setProfile(null)} />;
  }

  if (tab === 'inbox') {
    return (
      <InboxView
        requests={inboxRequests}
        messages={inboxMessages}
        onAccept={(person) => connect(person, 'accept')}
        onOpen={(person) => {
          setSelected(person);
          setTab('network');
        }}
        onBack={() => setTab('discover')}
      />
    );
  }

  const visiblePeople = tab === 'discover' ? people : connections;
  const inboxTotal = inboxRequests.length + inboxMessages.length;

  return (
    <section className="bg-white rounded-3xl border border-blue-100/80 p-6 sm:p-7 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
              Peer Network
            </div>
            <h2 className="text-lg font-black text-[#1A202C]">Connect & Collaborate</h2>
          </div>
        </div>

        {/* Inbox Button */}
        <button
          type="button"
          onClick={() => setTab('inbox')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] hover:bg-blue-100 border border-blue-100 text-xs font-bold transition-colors cursor-pointer"
        >
          <Mail size={14} />
          <span>Inbox</span>
          {inboxTotal > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#2563EB] text-white text-[10px] font-black">
              {inboxTotal}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 pt-4 pb-3">
        <button
          type="button"
          onClick={() => setTab('discover')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            tab === 'discover'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-[#F8FAFC] text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB]'
          }`}
        >
          Discover Peers
        </button>
        <button
          type="button"
          onClick={() => setTab('network')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            tab === 'network'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-[#F8FAFC] text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB]'
          }`}
        >
          My Network ({connections.length})
        </button>
      </div>

      {error && (
        <p className="my-2 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
          {error}
        </p>
      )}

      {/* People Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 mt-2">
        {visiblePeople.map((person) => (
          <article
            key={person.id}
            className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 flex flex-col justify-between hover:border-blue-200 transition-all"
          >
            <button
              type="button"
              onClick={() => setProfile(person)}
              className="flex w-full items-start gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold bg-blue-100 text-[#2563EB] shrink-0 border border-blue-200 overflow-hidden text-xs">
                {person.profilePicture ? (
                  <img src={person.profilePicture} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(person.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1A202C] group-hover:text-[#2563EB] transition-colors truncate">
                  {person.name}
                </h3>
                <p className="truncate text-[11px] font-medium text-[#64748B]">
                  {person.classification || person.email}
                </p>
                <p className="text-[10px] font-bold text-[#2563EB] mt-0.5">
                  View Profile & Activity →
                </p>
              </div>
            </button>

            {/* Action buttons */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex gap-2">
              {person.connectionStatus === 'incoming' && (
                <>
                  <button
                    type="button"
                    onClick={() => connect(person, 'accept')}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check size={13} /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => connect(person, 'decline')}
                    className="rounded-xl bg-slate-200 hover:bg-slate-300 px-3 py-1.5 text-xs font-bold text-[#1A202C] transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </>
              )}

              {person.connectionStatus === 'none' && (
                <button
                  type="button"
                  onClick={() => connect(person)}
                  className="flex-1 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <UserPlus size={13} /> Connect
                </button>
              )}

              {person.connectionStatus === 'pending' && (
                <span className="flex-1 rounded-xl bg-slate-100 py-1.5 text-center text-xs font-bold text-[#94A3B8]">
                  Pending
                </span>
              )}

              {person.connectionStatus === 'connected' && (
                <button
                  type="button"
                  onClick={() => setSelected(person)}
                  className="flex-1 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#2563EB] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageCircle size={13} /> Message
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {visiblePeople.length === 0 && (
        <div className="py-8 text-center text-xs font-medium text-[#64748B]">
          {tab === 'discover'
            ? 'No new peer recommendations at this moment.'
            : 'You have not connected with any peers yet.'}
        </div>
      )}

      {/* Chat View Modal */}
      {selected && (
        <ChatView
          person={selected}
          messages={messages}
          draft={draft}
          setDraft={setDraft}
          onSend={send}
          onClose={() => setSelected(null)}
          userId={String(user?.id)}
        />
      )}
    </section>
  );
}

function ProfileView({
  person,
  posts,
  onBack,
}: {
  person: Person;
  posts: NetworkPost[];
  onBack: () => void;
}) {
  const authored = posts.filter((post) => post.authorName === person.name);

  return (
    <section className="bg-white rounded-3xl border border-blue-100/80 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer mb-6"
      >
        <ArrowLeft size={16} /> Back to Peer Network
      </button>

      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 border border-blue-200 flex items-center justify-center text-xl font-black text-[#2563EB] overflow-hidden">
          {person.profilePicture ? (
            <img src={person.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            initials(person.name)
          )}
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1A202C]">{person.name}</h2>
          <p className="text-xs sm:text-sm font-medium text-[#64748B]">
            {person.classification || person.email}
          </p>
        </div>
      </div>

      <h3 className="text-sm font-extrabold text-[#1A202C] mt-6 mb-3">Posts & Activity</h3>

      <div className="space-y-3">
        {authored.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4"
          >
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span className="font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                {post.category}
              </span>
              <span>{post.timeAgo}</span>
            </div>
            <h4 className="font-bold text-sm text-[#1A202C] mt-1">{post.title}</h4>
            <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{post.content}</p>
          </article>
        ))}
        {authored.length === 0 && (
          <p className="text-xs font-medium text-[#64748B] py-4 text-center">
            No published posts by this peer yet.
          </p>
        )}
      </div>
    </section>
  );
}

function InboxView({
  requests,
  messages,
  onAccept,
  onOpen,
  onBack,
}: {
  requests: Person[];
  messages: InboxMessage[];
  onAccept: (person: Person) => void;
  onOpen: (person: Person) => void;
  onBack: () => void;
}) {
  return (
    <section className="bg-white rounded-3xl border border-blue-100/80 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer mb-6"
      >
        <ArrowLeft size={16} /> Back to Peer Network
      </button>

      <h2 className="text-xl font-black text-[#1A202C] mb-6">Network Inbox</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider mb-3">
            Connection Requests ({requests.length})
          </h3>
          {requests.length === 0 ? (
            <p className="text-xs text-[#94A3B8] italic">No pending connection requests.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#F8FAFC] p-3.5"
                >
                  <span className="font-bold text-xs sm:text-sm text-[#1A202C]">
                    {person.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAccept(person)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider mb-3">
            Messages ({messages.length})
          </h3>
          {messages.length === 0 ? (
            <p className="text-xs text-[#94A3B8] italic">No direct messages yet.</p>
          ) : (
            <div className="space-y-2">
              {messages.map(
                (message) =>
                  message.sender && (
                    <button
                      type="button"
                      key={message.id}
                      onClick={() => onOpen(message.sender!)}
                      className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] hover:bg-blue-50/40 p-3.5 text-left transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#1A202C]">
                          {message.sender.name}
                        </div>
                        <div className="text-xs text-[#64748B] truncate mt-0.5">
                          {message.text}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#94A3B8]">{message.createdAt}</span>
                    </button>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChatView({
  person,
  messages,
  draft,
  setDraft,
  onSend,
  onClose,
  userId,
}: {
  person: Person;
  messages: ChatMessage[];
  draft: string;
  setDraft: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
  userId: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[min(620px,90vh)] w-full max-w-lg flex-col rounded-3xl bg-white border border-blue-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center">
              {initials(person.name)}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1A202C]">Chat with {person.name}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">Online</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#1A202C] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4 bg-[#F8FAFC]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed ${
                message.senderId === userId
                  ? 'ml-auto bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-[#1A202C]'
              }`}
            >
              {message.text}
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-xs text-[#94A3B8] text-center py-8">
              Send your first message to connect!
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-3.5 bg-white">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend();
            }}
            placeholder="Write a message..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-[#1A202C] outline-none focus:border-[#2563EB] bg-[#F8FAFC] focus:bg-white"
          />
          <button
            type="button"
            onClick={onSend}
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-4 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
