import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Thread — Good conversations, uninterrupted.', template: '%s · Thread' },
  description:
    'A little more connection. A lot less noise. Thread brings thoughtful direct and group conversations into one calm space.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
