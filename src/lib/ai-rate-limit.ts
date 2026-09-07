// Best-effort burst protection per warm server instance, not a distributed quota.
export function createAIRateLimiter() {
  const buckets = new Map<string, { count: number; until: number; active: number }>();
  return (key: string, now = Date.now()) => {
    for (const [id, bucket] of buckets)
      if (bucket.until <= now && !bucket.active) buckets.delete(id);
    let bucket = buckets.get(key);
    if (!bucket) {
      if (buckets.size >= 5000) return { retryAfter: 60, release: () => {} };
      bucket = { count: 0, until: now + 60000, active: 0 };
      buckets.set(key, bucket);
    }
    if (bucket.until <= now) {
      bucket.count = 0;
      bucket.until = now + 60000;
    }
    if (bucket.count >= 10 || bucket.active >= 2)
      return { retryAfter: Math.max(1, Math.ceil((bucket.until - now) / 1000)), release: () => {} };
    bucket.count++;
    bucket.active++;
    let released = false;
    return {
      retryAfter: 0,
      release: () => {
        if (!released) {
          bucket.active--;
          released = true;
        }
      },
    };
  };
}

export const limitAI = createAIRateLimiter();
