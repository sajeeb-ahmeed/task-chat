'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronUp, Users } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { canSend, isNearBottom, nextCursor, orderedMessages } from '@/lib/messages';
import { conversationName, type Conversation, type Message, type Session } from '@/lib/types';
import { Avatar, Spinner } from '@/components/ui';

const time = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const day = (date: string) =>
  new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

export function ChatPanel({
  conversation,
  session,
  connected,
  back,
}: {
  conversation: Conversation;
  session: Session;
  connected: boolean;
  back: () => void;
}) {
  const client = useQueryClient();
  const id = conversation._id;
  const history = useInfiniteQuery({
    queryKey: ['messages', session.user._id, id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => api.history(session.token, id, pageParam, signal),
    getNextPageParam: (page, _pages, param) => nextCursor(page, param),
    refetchInterval: connected ? false : 15000,
  });
  const live = useQuery<Message[]>({
    queryKey: ['live', session.user._id, id],
    queryFn: () => [],
    enabled: false,
    initialData: [],
  });
  const messages = useMemo(
    () => orderedMessages(history.data?.pages, live.data),
    [history.data?.pages, live.data],
  );
  const scroll = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const follow = useRef(true);
  const initialized = useRef(false);
  const lastSeen = useRef('');
  const prepend = useRef<{ id: string; offset: number } | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [showJump, setShowJump] = useState(false);
  const draftKey = `thread.draft.${session.user._id}.${id}`;
  const [text, setText] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(draftKey) || '' : '',
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (text) sessionStorage.setItem(draftKey, text);
    else sessionStorage.removeItem(draftKey);
  }, [text, draftKey]);
  useLayoutEffect(() => {
    const el = scroll.current;
    if (!el) return;
    if (prepend.current && !history.isFetchingNextPage) {
      const anchor = el.querySelector(
        `[data-message-id="${CSS.escape(prepend.current.id)}"] .message-row`,
      );
      if (anchor) el.scrollTop += anchor.getBoundingClientRect().top - prepend.current.offset;
      prepend.current = null;
    }
    const latest = messages.at(-1)?._id || '';
    if (!initialized.current && !history.isPending) {
      el.scrollTop = el.scrollHeight;
      initialized.current = true;
    } else if (latest && latest !== lastSeen.current) {
      if (follow.current) {
        el.scrollTop = el.scrollHeight;
      } else {
        setNewCount((count) => count + 1);
        setShowJump(true);
      }
    }
    lastSeen.current = latest;
  }, [messages, history.isPending, history.isFetchingNextPage]);
  useEffect(() => {
    const el = textarea.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  }, [text]);
  function jump() {
    const el = scroll.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    follow.current = true;
    setNewCount(0);
    setShowJump(false);
  }
  function onScroll() {
    const el = scroll.current;
    if (!el) return;
    follow.current = isNearBottom(el.scrollHeight, el.scrollTop, el.clientHeight);
    setShowJump(!follow.current);
    if (follow.current) setNewCount(0);
  }
  async function older() {
    const el = scroll.current;
    if (el) {
      // Anchor the actual message row, not total height: pagination can also
      // move a date divider or remove the "load earlier" control.
      const anchor = [...el.querySelectorAll<HTMLElement>('[data-message-id] .message-row')].find(
        (row) => row.getBoundingClientRect().bottom >= el.getBoundingClientRect().top,
      );
      const anchorId = anchor?.closest('[data-message-id]')?.getAttribute('data-message-id');
      if (anchor && anchorId)
        prepend.current = { id: anchorId, offset: anchor.getBoundingClientRect().top };
    }
    await history.fetchNextPage();
  }
  async function send(event?: React.FormEvent) {
    event?.preventDefault();
    if (!canSend(text) || sending || uncertain) return;
    const value = text.trim();
    setSending(true);
    setError('');
    try {
      const message = await api.send(session.token, id, value);
      client.setQueryData<Message[]>(['live', session.user._id, id], (old = []) => [
        ...old.filter((m) => m._id !== message._id),
        message,
      ]);
      void client.invalidateQueries({ queryKey: ['conversations'] });
      sessionStorage.removeItem(draftKey);
      if (mounted.current) {
        setText('');
        follow.current = true;
        jump();
        textarea.current?.focus();
      }
    } catch (e) {
      if (mounted.current) {
        const network = e instanceof ApiError && e.status === 0;
        setUncertain(network);
        setError(
          network
            ? 'Delivery is unconfirmed. Check the latest messages before sending again; your draft is safe.'
            : e instanceof Error
              ? e.message
              : 'Message could not be sent. Your draft is safe.',
        );
      }
    } finally {
      if (mounted.current) setSending(false);
    }
  }
  const title = conversationName(conversation);
  return (
    <section className="chat-panel" aria-label={`Conversation with ${title}`}>
      <header className="chat-header">
        <button
          className="icon-button mobile-back"
          onClick={back}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar name={title} group={conversation.type === 'group'} />
        <div className="chat-heading">
          <h2>{title}</h2>
          <span>
            {conversation.type === 'group'
              ? `${conversation.participants?.length || 3} people · a shared space`
              : 'A little space for the two of you'}
          </span>
        </div>
        {conversation.type === 'group' && (
          <button
            className={`icon-button ${showPeople ? 'selected' : ''}`}
            aria-label="View group members"
            aria-expanded={showPeople}
            onClick={() => setShowPeople((p) => !p)}
          >
            <Users size={19} />
          </button>
        )}
        <span className="chat-header-tag">
          {conversation.type === 'group' ? 'GROUP' : 'DIRECT'}
        </span>
      </header>
      {showPeople && (
        <div className="members-strip">
          {conversation.participants?.map((p) => (
            <span key={p._id}>
              <Avatar name={p.name} size="tiny" />
              {p.name}
              {p._id === session.user._id ? ' (you)' : ''}
              {conversation.admins?.includes(p._id) ? ' · admin' : ''}
            </span>
          ))}
        </div>
      )}
      {!connected && (
        <div className="connection-banner" role="status">
          <span className="pulse-dot amber" /> Reconnecting… checking for messages every 15 seconds.
        </div>
      )}
      <div className="message-area">
        <div
          className="message-scroll"
          ref={scroll}
          onScroll={onScroll}
          aria-label="Message history"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
        >
          {history.isPending ? (
            <div className="message-loading" role="status">
              <Spinner />
              <p>Gathering your conversation…</p>
              <div className="skeleton" />
              <div className="skeleton short" />
              <div className="skeleton" />
            </div>
          ) : history.isError && !messages.length ? (
            <div className="small-empty">
              <p>We couldn’t load this conversation.</p>
              <small>{history.error.message}</small>
              <button className="button small" onClick={() => history.refetch()}>
                Try again
              </button>
            </div>
          ) : (
            <>
              {history.hasNextPage && (
                <button
                  className="older-button"
                  onClick={older}
                  disabled={history.isFetchingNextPage}
                >
                  {history.isFetchingNextPage ? <Spinner /> : <ChevronUp size={15} />} Load earlier
                  messages
                </button>
              )}
              {history.isFetchNextPageError && (
                <div className="error-box" role="alert">
                  Older messages couldn’t be loaded.{' '}
                  <button className="text-button" onClick={older}>
                    Try again
                  </button>
                </div>
              )}
              {!messages.length && (
                <div className="conversation-start">
                  <span className="start-mark">“</span>
                  <h3>
                    Every good thread starts
                    <br />
                    with a hello.
                  </h3>
                  <p>
                    You’re connected with {title}.<br />
                    Make the first move.
                  </p>
                  <button
                    className="hello-button"
                    onClick={() => {
                      setText('Hey! Great to connect 👋');
                      textarea.current?.focus();
                    }}
                  >
                    Say hello 👋
                  </button>
                </div>
              )}
              {messages.map((message, index) => {
                const own = message.sender === session.user._id;
                const person =
                  conversation.participants?.find((p) => p._id === message.sender) ||
                  conversation.participant;
                const newDay =
                  index === 0 || day(messages[index - 1].createdAt) !== day(message.createdAt);
                return (
                  <div key={message._id} data-message-id={message._id}>
                    {newDay && (
                      <div className="date-divider">
                        <span>{day(message.createdAt)}</span>
                      </div>
                    )}
                    <div className={`message-row ${own ? 'own' : ''}`}>
                      {!own && <Avatar name={person?.name || 'Member'} size="tiny" />}
                      <div className="message-content">
                        {!own && conversation.type === 'group' && (
                          <span className="sender-name">{person?.name || 'Group member'}</span>
                        )}
                        <div className="message-bubble">
                          {message.text.trim() || <em>Empty message</em>}
                        </div>
                        <div className="message-meta">
                          <time
                            dateTime={message.createdAt}
                            title={new Date(message.createdAt).toLocaleString()}
                          >
                            {time(message.createdAt)}
                          </time>
                          {own && <Check size={12} aria-label="Sent" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {showJump && (
          <button className="jump-button" onClick={jump}>
            <ArrowDown size={15} />
            {newCount
              ? `${newCount} new ${newCount === 1 ? 'message' : 'messages'}`
              : 'Back to latest'}
          </button>
        )}
      </div>
      <div className="composer-wrap">
        {error && (
          <div className="error-box send-error" role="alert">
            {error}
            {uncertain && (
              <div className="button-row">
                <button
                  className="text-button"
                  onClick={async () => {
                    await history.refetch();
                    jump();
                  }}
                >
                  Check latest messages
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setUncertain(false);
                    setError('Review your draft, then send only if it was not delivered.');
                  }}
                >
                  I’ve checked — unlock draft
                </button>
              </div>
            )}
          </div>
        )}
        <form className="composer" onSubmit={send}>
          <textarea
            ref={textarea}
            aria-label="Write a message"
            placeholder="A thought, a hello, a little something…"
            rows={1}
            value={text}
            disabled={sending}
            maxLength={4000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            className="send-button"
            type="submit"
            disabled={!canSend(text) || sending || uncertain}
            aria-label="Send message"
          >
            {sending ? <Spinner /> : <ArrowUp size={21} />}
          </button>
        </form>
        <div className="composer-hint">
          <span>
            {text.length > 3500 ? `${text.length}/4000` : 'A little thought goes a long way.'}
          </span>
          <span>
            <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for a new line
          </span>
        </div>
      </div>
    </section>
  );
}
