import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  MessageCircle,
  MoveUpRight,
  Users,
  Wind,
} from 'lucide-react';
import { Avatar, Brand } from '@/components/ui';
import { ChatPreview } from '@/features/landing/chat-preview';
export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Main navigation">
        <Brand />
        <div className="nav-center">
          <a href="#why-thread">Why Thread</a>
          <a href="#a-little-different">A little different</a>
        </div>
        <Link className="nav-cta" href="/login">
          Let’s talk <ArrowUpRight size={16} />
        </Link>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="pulse-dot" /> MADE FOR REAL CONNECTION
          </span>
          <h1>
            Good conversations.
            <br />
            <span>
              Less <em>everything else.</em>
            </span>
          </h1>
          <p>
            A little space for your people. Share a thought, bring everyone
            <br className="desktop-break" /> together, and pick up right where you left off.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/login">
              Start a conversation <ArrowUpRight size={17} />
            </Link>
            <a className="hero-secondary" href="#the-experience">
              Take a little look <ArrowDown size={15} />
            </a>
          </div>
          <div className="hero-assurance">
            <Check size={13} /> Just a name and number. You’re in.
          </div>
        </div>
        <div className="hero-annotation">
          <span>
            Less catching up.
            <br />
            More being here.
          </span>
          <MoveUpRight size={36} strokeWidth={1} />
        </div>
        <div id="the-experience">
          <ChatPreview />
        </div>
        <div className="hero-bottom">
          <span>FOR YOUR EVERYDAY PEOPLE</span>
          <div>
            <span>the inner circle</span>
            <span className="tiny-star">✳</span>
            <span>the next big idea</span>
            <span className="tiny-star">✳</span>
            <span>the just-because hello</span>
          </div>
        </div>
      </section>
      <section className="why-section" id="why-thread">
        <div className="section-intro">
          <span className="eyebrow">CONNECTION, WITHOUT THE CLUTTER</span>
          <h2>
            Everything a conversation needs.
            <br />
            <em>Room for what matters.</em>
          </h2>
          <p>Small details. A noticeably better feeling.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon">
              <MessageCircle size={22} strokeWidth={1.3} />
            </span>
            <div className="feature-visual two-bubbles">
              <span>A quick thought?</span>
              <span>Always. 🌱</span>
            </div>
            <span className="feature-number">01 / ONE TO ONE</span>
            <h3>A space for just you two.</h3>
            <p>
              Find someone by name or number.
              <br />
              Turn a small hello into a good conversation.
            </p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">
              <Users size={22} strokeWidth={1.3} />
            </span>
            <div className="feature-visual circle-avatars">
              <Avatar name="Alex Morgan" />
              <Avatar name="Jamie Chen" />
              <Avatar name="Sam Ellis" />
              <span>+ you</span>
            </div>
            <span className="feature-number">02 / BETTER TOGETHER</span>
            <h3>Bring your people along.</h3>
            <p>
              The weekend crew. The side project.
              <br />
              One shared space for the whole group.
            </p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">
              <Wind size={22} strokeWidth={1.3} />
            </span>
            <div className="feature-visual quiet-update">
              <span className="pulse-dot" /> A new thought, right on time.
              <Check size={13} />
            </div>
            <span className="feature-number">03 / NATURALLY IN SYNC</span>
            <h3>Here, in the moment.</h3>
            <p>
              Messages arrive as the conversation happens.
              <br />
              No refresh. Just a natural back-and-forth.
            </p>
          </article>
        </div>
      </section>
      <section className="difference-section" id="a-little-different">
        <div className="difference-art">
          <span className="difference-date">A MOMENT TO CATCH UP</span>
          <div className="bookmark-line">
            <span />
            <p>
              “Wait, what was that café
              <br />
              you mentioned last week?”
            </p>
          </div>
          <div className="saved-place">
            <span className="saved-icon">↳</span>
            <div>
              <strong>Your place, kept.</strong>
              <p>New messages can wait a moment.</p>
            </div>
            <span className="saved-count">3</span>
          </div>
          <div className="art-thread" />
        </div>
        <div className="difference-copy">
          <span className="eyebrow">A LITTLE MORE THOUGHTFUL</span>
          <h2>
            Keep the thread.
            <br />
            <em>Keep your place.</em>
          </h2>
          <p>
            Revisiting a good idea? Reading the messages you missed? Take your time. New messages
            won’t pull you away.
          </p>
          <p>
            When you’re ready, one tap brings you back to now. Because a conversation should move at
            your pace.
          </p>
          <a href="#the-experience">
            Feel the difference <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <section className="closing-section">
        <span className="eyebrow light">THERE’S SOMEONE WORTH SAYING HELLO TO</span>
        <h2>
          Good things start
          <br />
          with a <em>conversation.</em>
        </h2>
        <Link href="/login" className="button lime">
          Find your people <ArrowRight size={17} />
        </Link>
        <span className="closing-note">No noise. No fuss. Just you, connected.</span>
        <div className="closing-orbit" />
      </section>
      <footer className="landing-footer">
        <Brand />
        <span>A little more connection. A lot less noise.</span>
        <span>© {new Date().getFullYear()} Thread</span>
        <a href="#">Back to the top ↑</a>
      </footer>
    </main>
  );
}
