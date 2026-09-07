'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Bot, RotateCcw, Send, X } from 'lucide-react';
import './sajib-ai.css';
import { AIAnswer } from './ai-answer';

type Message = { role: 'user' | 'assistant'; content: string };

export function SajibAI() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const locked = useRef(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (open && nearBottom.current) messagesEnd.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, pending, open]);

  async function send() {
    const content = draft.trim();
    if (!content || locked.current) return;
    locked.current = true;
    setPending(true);
    nearBottom.current = true;
    setUnread(false);
    setError('');
    const next: Message[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setDraft('');
    try {
      const response = await fetch('/api/sajib-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: next
            .slice(-12)
            .map((item) => ({ ...item, content: item.content.slice(0, 2400) })),
        }),
        signal: AbortSignal.timeout(50000),
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Sajib AI is unavailable. Please try again.',
        );
      }
      setMessages([...next, { role: 'assistant', content: data.reply }]);
      if (!nearBottom.current) setUnread(true);
    } catch (cause) {
      setMessages(messages);
      setDraft(content);
      setError(
        cause instanceof Error && cause.name !== 'TimeoutError'
          ? cause instanceof TypeError
            ? 'Connection interrupted. Your message is ready to try again.'
            : cause.message
          : 'The request timed out. Your message is ready to try again.',
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }

  return (
    <div className={`sajib-ai ${pathname.startsWith('/chat') ? 'sajib-ai-in-chat' : ''}`}>
      <button
        className="sajib-ai-launcher"
        aria-label="Open Sajib AI"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="sajib-ai-dialog"
        onClick={() => setOpen(true)}
      >
        <span className="sajib-ai-avatar">
          <Bot size={23} />
        </span>
        <span>
          <strong>Ask Sajib AI</strong>
          <small>Portfolio representative</small>
        </span>
      </button>
      <dialog
        ref={dialog}
        id="sajib-ai-dialog"
        className="sajib-ai-dialog"
        aria-labelledby="sajib-ai-title"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <header className="sajib-ai-header">
          <span className="sajib-ai-avatar">
            <Bot size={24} />
          </span>
          <div>
            <h2 id="sajib-ai-title">Sajib AI</h2>
            <p>Portfolio &amp; project assistant</p>
          </div>
          <button
            className="sajib-ai-icon"
            aria-label="New AI conversation"
            disabled={pending || messages.length === 0}
            onClick={() => {
              setMessages([]);
              setError('');
              setDraft('');
              setUnread(false);
              nearBottom.current = true;
              input.current?.focus();
            }}
          >
            <RotateCcw size={17} />
          </button>
          <button
            className="sajib-ai-icon"
            aria-label="Close Sajib AI"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </header>
        <div
          className="sajib-ai-transcript"
          ref={transcript}
          onScroll={() => {
            const element = transcript.current;
            if (element) {
              nearBottom.current =
                element.scrollHeight - element.scrollTop - element.clientHeight < 80;
              if (nearBottom.current) setUnread(false);
            }
          }}
          role="log"
          aria-label="Sajib AI conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.length === 0 && (
            <div className="sajib-ai-welcome">
              <span>MEET THE DEVELOPER</span>
              <h3>A little more about Sajib.</h3>
              <p>
                I’m Sajib’s AI representative. Ask about his projects, engineering experience, or
                skills.
              </p>
              <a href="https://sajib.dev.cv/" target="_blank" rel="noopener noreferrer">
                Explore the portfolio <ArrowUpRight size={14} />
              </a>
            </div>
          )}
          {messages.length === 0 && (
            <div className="sajib-ai-prompts">
              {['Show me Sajib’s projects', 'What is his strongest stack?'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setDraft(prompt);
                    input.current?.focus();
                  }}
                >
                  {prompt}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
          )}
          {messages.map((message, index) => (
            <div className={`sajib-ai-message sajib-ai-message-${message.role}`} key={index}>
              <strong>{message.role === 'user' ? 'You' : 'Sajib AI'}</strong>
              {message.role === 'assistant' ? (
                <AIAnswer content={message.content} />
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          ))}
          {pending && (
            <p className="sajib-ai-thinking" role="status">
              Sajib AI is thinking…
            </p>
          )}
          <div ref={messagesEnd} />
        </div>
        {unread && (
          <button
            className="sajib-ai-jump"
            onClick={() => {
              nearBottom.current = true;
              setUnread(false);
              messagesEnd.current?.scrollIntoView({ block: 'nearest' });
            }}
          >
            New answer ↓
          </button>
        )}
        <form
          className="sajib-ai-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          {error && (
            <p className="sajib-ai-error" role="alert">
              {error}
            </p>
          )}
          <div className="sajib-ai-composer">
            <textarea
              ref={input}
              aria-label="Message Sajib AI"
              placeholder="Ask about Sajib’s work…"
              rows={2}
              maxLength={1200}
              value={draft}
              readOnly={pending}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <button type="submit" aria-label="Send to Sajib AI" disabled={pending || !draft.trim()}>
              <Send size={18} />
            </button>
          </div>
          <p className="sajib-ai-note">
            AI can make mistakes. Verify important details.
            <span>Only messages in this panel go to Sajib’s assistant.</span>
          </p>
        </form>
      </dialog>
    </div>
  );
}
