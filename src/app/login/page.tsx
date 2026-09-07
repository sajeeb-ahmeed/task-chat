'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle, Check } from 'lucide-react';
import { Brand, Spinner } from '@/components/ui';
import { useAuth } from '@/components/providers';
import { api } from '@/lib/api';
export default function LoginPage() {
  const { session, login, ready, error: restoreError, retry, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (ready && session) router.replace('/chat');
  }, [ready, session, router]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!name.trim()) return setError('Please enter your name.');
    if (!/^\+?\d{7,15}$/.test(normalized))
      return setError('Enter a phone number with 7–15 digits, including your country code.');
    setBusy(true);
    try {
      login(await api.login(normalized, name.trim()));
      router.push('/chat');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Brand light />
        <div>
          <span className="eyebrow light">A SPACE FOR YOUR PEOPLE</span>
          <h1>
            Less noise.
            <br />
            More <em>connection.</em>
          </h1>
          <p>For the quick hellos, the big ideas, and everything in between.</p>
          <div className="login-note">
            <MessageCircle size={25} />
            <p>
              Good conversations start
              <br />
              with a simple hello.
            </p>
          </div>
        </div>
        <span className="story-footer">Thoughtfully made. Naturally connected.</span>
      </section>
      <section className="login-form-side">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="login-form-wrap">
          <span className="eyebrow">LET’S GET YOU SETTLED</span>
          <h2>Your people await.</h2>
          <p>Just your name and number. We’ll take it from here.</p>
          {!ready ? (
            <p className="status-line">
              <Spinner /> Restoring your session…
            </p>
          ) : restoreError ? (
            <div className="error-box" role="alert">
              {restoreError}
              <div className="button-row">
                <button className="button small" onClick={retry}>
                  Try again
                </button>
                <button className="text-button" onClick={logout}>
                  Use another account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                autoComplete="name"
                placeholder="e.g. Alex Morgan"
                maxLength={80}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+880 1XXXXXXXXX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-describedby="phone-hint"
              />
              <small id="phone-hint">
                Include your country code. New here? An account is created automatically.
              </small>
              {error && (
                <div className="error-box" role="alert">
                  {error}
                </div>
              )}
              <button className="button login-submit" disabled={busy}>
                {busy ? (
                  <Spinner />
                ) : (
                  <>
                    Let’s talk <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
          <div className="login-assurance">
            <Check size={15} /> No password to remember. No separate sign-up.
          </div>
          <p className="demo-disclosure">
            This is a take-home demo with phone-based sign-in. Please use a test number and keep
            conversations non-sensitive.
          </p>
        </div>
        <span className="login-copyright">
          © {new Date().getFullYear()} Thread. A little closer.
        </span>
      </section>
    </main>
  );
}
