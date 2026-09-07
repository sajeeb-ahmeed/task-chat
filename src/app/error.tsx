'use client';
import { Brand } from '@/components/ui';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="full-state">
      <Brand />
      <h1>A small interruption.</h1>
      <p>Something went wrong loading this screen. Let’s try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
