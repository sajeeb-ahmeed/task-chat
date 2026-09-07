import { expect, it } from 'vitest';
import { createAIRateLimiter } from './ai-rate-limit';

it('limits concurrent work and releases a slot only once', () => {
  const limit = createAIRateLimiter();
  const first = limit('a', 0);
  limit('a', 0);
  expect(limit('a', 0).retryAfter).toBe(60);
  first.release();
  first.release();
  expect(limit('a', 0).retryAfter).toBe(0);
  expect(limit('a', 0).retryAfter).toBe(60);
  expect(limit('b', 0).retryAfter).toBe(0);
});
it('bounds requests in a minute and permits work after expiry', () => {
  const limit = createAIRateLimiter();
  for (let i = 0; i < 10; i++) limit('a', 0).release();
  expect(limit('a', 1000).retryAfter).toBe(59);
  expect(limit('a', 60000).retryAfter).toBe(0);
});
