import Link from 'next/link';
import { LoaderCircle, MessagesSquare, Users } from 'lucide-react';
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Thread home">
      <MessagesSquare className="brand-mark" strokeWidth={1.9} aria-hidden="true" />
      thread<span className="brand-period">.</span>
    </Link>
  );
}
export function Avatar({
  name,
  group = false,
  size = '',
}: {
  name: string;
  group?: boolean;
  size?: string;
}) {
  const palette = ['sage', 'peach', 'lavender', 'sand'];
  const color = palette[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % palette.length];
  return (
    <span className={`avatar ${color} ${size}`} aria-hidden="true">
      {group ? (
        <Users size={18} />
      ) : (
        name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      )}
    </span>
  );
}
export function Spinner() {
  return <LoaderCircle className="spin" size={18} aria-label="Loading" />;
}
