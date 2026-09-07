import Link from 'next/link';
import { Brand } from '@/components/ui';
export default function NotFound() {
  return (
    <main className="full-state">
      <Brand />
      <span className="eyebrow">404 · A LOOSE THREAD</span>
      <h1>Nothing here just yet.</h1>
      <p>Let’s get you back to your people.</p>
      <Link className="button" href="/chat">
        Open conversations
      </Link>
    </main>
  );
}
