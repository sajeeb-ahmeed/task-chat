'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, LogOut, MessageCircle, Plus, Search, Users } from 'lucide-react';
import { useAuth } from '@/components/providers';
import { Avatar, Brand, Spinner } from '@/components/ui';
import { api } from '@/lib/api';
import { conversationName, type Session } from '@/lib/types';
import { useRealtime } from './use-realtime';
import { ChatPanel } from './chat-panel';
import { NewConversation } from './new-conversation';
export function ChatWorkspace({ selectedId }: { selectedId?: string }) {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (auth.ready && !auth.session && !auth.error) router.replace('/login');
  }, [auth.ready, auth.session, auth.error, router]);
  if (!auth.ready)
    return (
      <main className="full-state">
        <Brand />
        <Spinner />
        <p>Making room for you…</p>
      </main>
    );
  if (auth.error)
    return (
      <main className="full-state">
        <Brand />
        <p role="alert">{auth.error}</p>
        <button className="button" onClick={auth.retry}>
          Reconnect
        </button>
        <button className="text-button" onClick={auth.logout}>
          Sign in again
        </button>
      </main>
    );
  if (!auth.session)
    return (
      <main className="full-state">
        <Spinner />
      </main>
    );
  return <Workspace session={auth.session} selectedId={selectedId} logout={auth.logout} />;
}
function Workspace({
  session,
  selectedId,
  logout,
}: {
  session: Session;
  selectedId?: string;
  logout: () => void;
}) {
  const router = useRouter();
  const connected = useRealtime(session);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const conversations = useQuery({
    queryKey: ['conversations', session.user._id],
    queryFn: ({ signal }) => api.conversations(session.token, signal),
    refetchInterval: connected ? false : 15000,
  });
  const all = conversations.data?.data || [];
  const selected = all.find((c) => c._id === selectedId);
  const filtered = all.filter(
    (c) =>
      conversationName(c).toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'all' || c.type === filter),
  );
  const open = (id: string) => router.push(`/chat/${id}`);
  return (
    <main className={`workspace ${selectedId ? 'has-selection' : ''}`}>
      <aside className="rail">
        <Brand />
        <div className="rail-links">
          <span className="rail-link active" title="Conversations">
            <MessageCircle size={22} />
          </span>
          <button
            className="rail-link"
            aria-label="Start a group or direct chat"
            onClick={() => setCreating(true)}
          >
            <Users size={22} />
          </button>
        </div>
        <div className="rail-bottom">
          <Avatar name={session.user.name} size="small" />
          <button
            className="rail-link"
            aria-label="Sign out"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <aside className="conversation-sidebar">
        <header className="sidebar-title">
          <div>
            <span className="eyebrow">YOUR LITTLE CORNER</span>
            <h1>
              Conversations<span>.</span>
            </h1>
          </div>
          <button
            className="new-button"
            onClick={() => setCreating(true)}
            aria-label="New conversation"
          >
            <Plus size={20} />
          </button>
        </header>
        <label className="search-box sidebar-search">
          <Search size={17} />
          <input
            aria-label="Search conversations"
            placeholder="Find a conversation"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="conversation-tabs">
          {[
            ['all', 'All messages'],
            ['direct', 'Direct'],
            ['group', 'Groups'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? 'active' : ''}
              onClick={() => setFilter(value)}
            >
              {label}
              {value === 'all' && <span>{all.length}</span>}
            </button>
          ))}
        </div>
        <div className="conversation-list">
          {conversations.isPending ? (
            <div className="status-line">
              <Spinner /> Loading conversations…
            </div>
          ) : conversations.isError ? (
            <div className="error-box" role="alert">
              {conversations.error.message}
              <button className="text-button" onClick={() => conversations.refetch()}>
                Try again
              </button>
            </div>
          ) : !filtered.length ? (
            <div className="small-empty">
              <MessageCircle size={28} />
              <h3>{all.length ? 'No conversations found' : 'Your next hello is here.'}</h3>
              <p>
                {all.length
                  ? 'Try a different search or filter.'
                  : 'Start a conversation with someone you know.'}
              </p>
              {!all.length && (
                <button className="button small" onClick={() => setCreating(true)}>
                  Find your people <ArrowUpRight size={16} />
                </button>
              )}
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c._id}
                className={`conversation-item ${c._id === selectedId ? 'active' : ''}`}
                onClick={() => open(c._id)}
                aria-current={c._id === selectedId ? 'page' : undefined}
              >
                <Avatar name={conversationName(c)} group={c.type === 'group'} />
                <span className="conversation-copy">
                  <span className="conversation-top">
                    <strong>{conversationName(c)}</strong>
                    <time>
                      {c.lastMessage?.createdAt
                        ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </time>
                  </span>
                  <span className="conversation-preview">
                    {c.lastMessage?.sender === session.user._id ? 'You: ' : ''}
                    {c.lastMessage?.text?.trim() || 'The beginning of a good conversation'}
                  </span>
                  {c.type === 'group' && (
                    <span className="group-label">
                      <Users size={11} /> {c.participants?.length} people
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
        <footer className="sidebar-footer">
          <span className={`pulse-dot ${connected ? '' : 'amber'}`} />
          <span>{connected ? 'Connected. Ready when you are.' : 'Connecting to your people…'}</span>
        </footer>
      </aside>
      {selected ? (
        <ChatPanel
          key={selected._id}
          conversation={selected}
          session={session}
          connected={connected}
          back={() => router.push('/chat')}
        />
      ) : (
        <section className="workspace-welcome">
          <div className="welcome-orbit">
            <span className="orbit-one" />
            <span className="orbit-two" />
            <MessageCircle size={46} strokeWidth={1.2} />
            <span className="orbit-dot" />
          </div>
          <span className="eyebrow">HELLO, {session.user.name.split(' ')[0].toUpperCase()}</span>
          <h2>
            {selectedId && !conversations.isPending ? (
              'Let’s find your conversation.'
            ) : (
              <>
                Good things begin
                <br />
                with a <em>conversation.</em>
              </>
            )}
          </h2>
          <p>
            {selectedId && !conversations.isPending
              ? 'This conversation may be unavailable, or the list needs a refresh.'
              : 'A familiar face. A shared idea. A simple hello. Choose a conversation or start something new.'}
          </p>
          {selectedId && conversations.isPending ? (
            <Spinner />
          ) : (
            <div className="button-row">
              <button
                className="button"
                onClick={() => (selectedId ? conversations.refetch() : setCreating(true))}
              >
                {selectedId ? 'Refresh conversations' : 'Start a conversation'}
                <ArrowUpRight size={17} />
              </button>
              {selectedId && (
                <button className="text-button" onClick={() => router.push('/chat')}>
                  Back to conversations
                </button>
              )}
            </div>
          )}
          <div className="welcome-note">A little more connection. A lot less noise.</div>
        </section>
      )}
      {creating && (
        <NewConversation session={session} close={() => setCreating(false)} open={open} />
      )}
    </main>
  );
}
