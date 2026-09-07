import Link from 'next/link';
import { Brand } from '@/components/ui';
export default function Home() { return <main className="full-state"><Brand /><h1>Good conversations, uninterrupted.</h1><Link href="/login" className="button">Start a conversation</Link></main>; }
