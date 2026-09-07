import type { InfiniteData } from '@tanstack/react-query';
import type { Message, MessagePage } from './types';
export type History = InfiniteData<MessagePage, string | undefined>;
export function orderedMessages(pages: MessagePage[] = [], live: Message[] = []): Message[] {
  const messages = new Map<string, Message>();
  for (const message of [...pages.flatMap(p => p.messages), ...live]) messages.set(message._id, message);
  return [...messages.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a._id.localeCompare(b._id));
}
export function nextCursor(page: MessagePage, previous?: string): string | undefined {
  const oldest = page.messages.at(-1)?._id;
  return page.hasMore && oldest && oldest !== previous ? oldest : undefined;
}
export const isNearBottom = (height: number, top: number, client: number) => height - top - client < 100;
export const canSend = (text: string) => text.trim().length > 0;
export function normalizeSocketMessage(value: unknown): Message | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const id = raw._id || raw.id;
  const date = new Date(raw.createdAt as string | number);
  if (typeof id !== 'string' || typeof raw.conversation !== 'string' || typeof raw.sender !== 'string' || typeof raw.text !== 'string' || Number.isNaN(date.getTime())) return null;
  return { _id: id, conversation: raw.conversation, sender: raw.sender, text: raw.text, createdAt: date.toISOString() };
}
