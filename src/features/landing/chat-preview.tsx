'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Plus, Search, Sparkles, RotateCcw } from 'lucide-react';
import { Avatar } from '@/components/ui';
export function ChatPreview() {
  const [reading, setReading] = useState(false);
  const [arrived, setArrived] = useState(false);
  function simulate() {
    setReading(true);
    setArrived(true);
  }
  return (
    <div className="preview-stage">
      <div className="preview-float">
        <span className="pulse-dot" />
        <span>A little closer, in real time.</span>
      </div>
      <div className="product-preview" aria-label="Interactive chat preview">
        <aside className="preview-sidebar">
          <div className="preview-sidebar-heading">
            <strong>
              Messages<span> 3</span>
            </strong>
            <Plus size={14} />
          </div>
          <div className="preview-search">
            <Search size={12} /> Find your people
          </div>
          {[
            ['The Sunday Club', 'Coffee, a walk, no agenda.', 'group'],
            ['Jamie Chen', 'That’s what I was thinking!', 'direct'],
            ['Alex Morgan', 'A little idea for tomorrow…', 'direct'],
          ].map(([name, message, type], i) => (
            <div className={`preview-contact ${i === 0 ? 'active' : ''}`} key={name}>
              <Avatar name={name} group={type === 'group'} size="small" />
              <div>
                <strong>{name}</strong>
                <small>{message}</small>
              </div>
              {i === 0 && <span className="preview-unread">2</span>}
            </div>
          ))}
          <div className="preview-sidebar-bottom">
            <span className="pulse-dot" /> All your people. One place.
          </div>
        </aside>
        <section className="preview-panel">
          <div className="preview-panel-heading">
            <Avatar name="The Sunday Club" group size="small" />
            <div>
              <strong>
                The Sunday Club <span>☀</span>
              </strong>
              <small>3 people, one good plan</small>
            </div>
            <span className="preview-menu">···</span>
          </div>
          <div className="preview-messages" tabIndex={0} aria-label="Sample message history">
            <span className="preview-date">TODAY, A LITTLE EARLIER</span>
            <div className="preview-message">
              <Avatar name="Jamie" size="tiny" />
              <div>
                <span>Jamie</span>
                <p>
                  What if we did absolutely nothing
                  <br className="desktop-break" /> productive this Sunday? ☀️
                </p>
                <small>10:42 AM</small>
              </div>
            </div>
            <div className="preview-message own">
              <div>
                <p>Finally, a plan I can get behind.</p>
                <small>
                  10:43 AM <Check size={10} />
                </small>
              </div>
            </div>
            <div className="preview-message">
              <Avatar name="Alex" size="tiny" />
              <div>
                <span>Alex</span>
                <p>
                  Coffee, a walk, no agenda.
                  <br />I know just the place. 🌿
                </p>
                <small>10:44 AM</small>
              </div>
            </div>
            {arrived && !reading && (
              <div className="preview-message own animate-message">
                <div>
                  <p>Count me in. Same corner café? ☕</p>
                  <small>
                    Just now <Check size={10} />
                  </small>
                </div>
              </div>
            )}
            {reading && (
              <div className="preview-reading">
                <span>Take your time. Your place is saved.</span>
                <button onClick={() => setReading(false)}>
                  <ArrowDown size={12} /> 1 new message
                </button>
              </div>
            )}
          </div>
          <div className="preview-composer">
            <span>A thought, a hello, a little something…</span>
            <span className="preview-send">
              <ArrowUp size={16} />
            </span>
          </div>
        </section>
      </div>
      <div className="preview-footnote">
        <div>
          <Sparkles size={14} />
          <span>
            {reading
              ? 'New messages wait. Your reading doesn’t have to.'
              : arrived
                ? 'All caught up. Right where you want to be.'
                : 'Try a calmer kind of conversation.'}
          </span>
        </div>
        <button
          onClick={
            arrived
              ? () => {
                  setReading(false);
                  setArrived(false);
                }
              : simulate
          }
        >
          {arrived ? (
            <>
              <RotateCcw size={12} /> Reset preview
            </>
          ) : (
            <>
              Send a little hello <ArrowUp size={12} />
            </>
          )}
        </button>
      </div>
      <span className="preview-caption">AN INTERACTIVE PREVIEW · SAMPLE CONVERSATION</span>
    </div>
  );
}
