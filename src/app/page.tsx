import Link from 'next/link';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  MessageCircle,
  Users,
  Zap,
  Bookmark,
  RefreshCw,
  PencilLine,
} from 'lucide-react';
import { Brand } from '@/components/ui';
import { ChatPreview } from '@/features/landing/chat-preview';
export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Main navigation">
        <Brand />
        <div className="nav-center">
          <a href="#why-thread">The essentials</a>
          <a href="#a-little-different">Made for focus</a>
        </div>
        <Link className="nav-cta" href="/login">
          Let’s talk <ArrowUpRight size={16} />
        </Link>
      </nav>
      <section className="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <span className="hero-eyebrow">YOUR PEOPLE. ONE THREAD.</span>
            <h1>
              Good conversations.
              <br />
              <span>Nothing in the way.</span>
            </h1>
          </div>
          <div className="hero-description">
            <p>
              A focused space for quick hellos, shared ideas, and the people who make them matter.
              Pick up exactly where you left off.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/login">
                Start a conversation <ArrowUpRight size={17} />
              </Link>
              <a className="hero-secondary" href="#the-experience">
                Explore Thread <ArrowDown size={15} />
              </a>
            </div>
            <div className="hero-assurance">
              <Check size={14} /> Just your name and number. You’re in.
            </div>
          </div>
        </div>
        <div id="the-experience">
          <ChatPreview />
        </div>
        <div className="hero-bottom">
          <span>A little less friction. A lot more connection.</span>
          <div>
            <span>
              <MessageCircle size={14} /> Direct chats
            </span>
            <span>
              <Users size={14} /> Group conversations
            </span>
            <span>
              <Zap size={14} /> Real-time updates
            </span>
          </div>
        </div>
      </section>
      <section className="why-section" id="why-thread">
        <div className="section-intro">
          <div>
            <span className="eyebrow">LESS TO MANAGE. MORE TO SAY.</span>
            <h2>
              Everything you need.
              <br />
              Space to be yourself.
            </h2>
          </div>
          <p>
            Thoughtful essentials that get out of your way, so the conversation can take the lead.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon">
              <MessageCircle size={22} />
            </span>
            <span className="feature-number">01 / DIRECT</span>
            <h3>From a name to a hello.</h3>
            <p>
              Find your people by name or number. Start a conversation without a complicated setup.
            </p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">
              <Users size={22} />
            </span>
            <span className="feature-number">02 / TOGETHER</span>
            <h3>A place for your people.</h3>
            <p>
              The project crew. Your closest friends. Bring everyone into one shared conversation.
            </p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">
              <Zap size={22} />
            </span>
            <span className="feature-number">03 / IN THE MOMENT</span>
            <h3>Keep the conversation moving.</h3>
            <p>New messages arrive as they happen. Stay connected without reaching for refresh.</p>
          </article>
        </div>
      </section>
      <section className="difference-section" id="a-little-different">
        <div className="difference-copy">
          <span className="eyebrow">DESIGNED AROUND YOUR ATTENTION</span>
          <h2>
            Your conversation.
            <br />
            At your pace.
          </h2>
          <p>
            Good software respects the moment you’re in. Read an earlier message, finish a thought,
            or take a break. Thread keeps your place.
          </p>
          <a href="#the-experience">
            Try the reading experience <ArrowUpRight size={16} />
          </a>
        </div>
        <ul className="principle-list">
          <li>
            <Bookmark size={21} />
            <div>
              <strong>Read without interruption</strong>
              <p>New messages wait while you catch up. Jump to the latest when you’re ready.</p>
            </div>
          </li>
          <li>
            <PencilLine size={21} />
            <div>
              <strong>Leave a thought unfinished</strong>
              <p>Your draft stays with its conversation when you move between chats in this tab.</p>
            </div>
          </li>
          <li>
            <RefreshCw size={21} />
            <div>
              <strong>Pick up after a pause</strong>
              <p>Reconnect and catch the messages that arrived while you were away.</p>
            </div>
          </li>
        </ul>
      </section>
      <section className="closing-section">
        <div>
          <span className="eyebrow light">START SOMETHING GOOD</span>
          <h2>
            There’s a conversation
            <br />
            worth having.
          </h2>
        </div>
        <Link href="/login" className="button lime">
          Find your people <ArrowUpRight size={18} />
        </Link>
      </section>
      <footer className="landing-footer">
        <Brand />
        <span>
          Designed &amp; built by{' '}
          <a
            className="footer-portfolio"
            href="https://sajib.dev.cv/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sajib Ahmed <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </span>
        <span>© {new Date().getFullYear()} Thread</span>
        <a href="#">Back to the top ↑</a>
      </footer>
    </main>
  );
}
