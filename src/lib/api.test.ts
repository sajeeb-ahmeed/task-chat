import { afterEach, expect, it, vi } from 'vitest';
import { request } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

it('combines caller cancellation with the request timeout', async () => {
  const callerController = new AbortController();
  const timeoutController = new AbortController();
  const combinedController = new AbortController();

  const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);

  const anySpy = vi.spyOn(AbortSignal, 'any').mockReturnValue(combinedController.signal);

  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await request<{ ok: boolean }>('/test', undefined, {
    signal: callerController.signal,
  });

  expect(timeoutSpy).toHaveBeenCalledWith(25_000);
  expect(anySpy).toHaveBeenCalledWith([callerController.signal, timeoutController.signal]);

  expect(fetchSpy).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      signal: combinedController.signal,
    }),
  );
});
