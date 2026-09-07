import { describe, expect, it } from 'vitest';
import {
  canSend,
  isNearBottom,
  nextCursor,
  normalizeSocketMessage,
  orderedMessages,
} from './messages';
import type { Message } from './types';
const a: Message = {
  _id: 'a',
  conversation: 'chat',
  sender: 'user',
  text: 'hello',
  createdAt: '2026-09-07T10:00:00.000Z',
};
const b: Message = { ...a, _id: 'b', createdAt: '2026-09-07T10:01:00.000Z' };
describe('the observed API contract', () => {
  it('normalizes a numeric socket timestamp and id to the REST shape', () => {
    expect(
      normalizeSocketMessage({
        id: a._id,
        conversation: a.conversation,
        sender: a.sender,
        text: a.text,
        createdAt: Date.parse(a.createdAt),
      }),
    ).toEqual(a);
  });
  it('rejects malformed events instead of corrupting the cache', () => {
    expect(normalizeSocketMessage({ id: 'a', createdAt: 'invalid' })).toBeNull();
    expect(normalizeSocketMessage(null)).toBeNull();
  });
  it('deduplicates inclusive pagination boundaries and REST/socket echoes', () => {
    expect(
      orderedMessages(
        [
          { messages: [b, a], hasMore: true },
          { messages: [a], hasMore: false },
        ],
        [b],
      ),
    ).toEqual([a, b]);
  });
  it('uses IDs and stops a non-advancing cursor', () => {
    expect(nextCursor({ messages: [b, a], hasMore: true })).toBe('a');
    expect(nextCursor({ messages: [a], hasMore: true }, 'a')).toBeUndefined();
    expect(nextCursor({ messages: [a], hasMore: false })).toBeUndefined();
  });
  it('keeps a reader away from the bottom detached from incoming messages', () => {
    expect(isNearBottom(1200, 100, 600)).toBe(false);
    expect(isNearBottom(1200, 580, 600)).toBe(true);
  });
  it('rejects whitespace, accepts trimmed text and multiline content', () => {
    expect(canSend(' \n\t ')).toBe(false);
    expect(canSend(' hello ')).toBe(true);
    expect(canSend('hello\nthere')).toBe(true);
  });
});
