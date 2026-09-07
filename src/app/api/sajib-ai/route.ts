const ENDPOINT = 'https://sajib.dev.cv/api/sajib-agent.php';
const MAX_BODY = 120000;

export const maxDuration = 60;

function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return error('Invalid origin.', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return error('Expected JSON.', 415);
  }
  // Bound the stream before parsing; Content-Length alone is not trustworthy.
  const reader = request.body?.getReader();
  if (!reader) return error('A message is required.', 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return error('Message history is too large.', 413);
    }
    chunks.push(value);
  }
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return error('Invalid JSON.', 400);
  }
  if (
    !body ||
    typeof body.message !== 'string' ||
    !body.message.trim() ||
    body.message.length > 1200
  ) {
    return error('Write a message of up to 1,200 characters.', 400);
  }
  if (
    !Array.isArray(body.history) ||
    body.history.length > 12 ||
    body.history.some(
      (item: unknown) =>
        !item ||
        typeof item !== 'object' ||
        !('role' in item) ||
        !['user', 'assistant'].includes(String(item.role)) ||
        !('content' in item) ||
        typeof item.content !== 'string' ||
        item.content.length > 2400,
    )
  )
    return error('Invalid message history.', 400);

  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        message: body.message.trim(),
        history: body.history.map((item: { role: string; content: string }) => ({
          role: item.role,
          content: item.content,
        })),
        website: '',
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(45000),
    });
    if (!upstream.ok)
      return error(
        upstream.status === 429
          ? 'Sajib AI is busy. Please try again shortly.'
          : 'Sajib AI is unavailable. Please try again.',
        upstream.status === 429 ? 429 : 502,
      );
    const data = await upstream.json();
    if (typeof data.reply !== 'string' || !data.reply.trim())
      return error('Sajib AI returned an empty reply. Please try again.', 502);
    // Never forward upstream cookies, recovery identities, or Thread credentials.
    return Response.json(
      { reply: data.reply.trim() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return error('Sajib AI could not respond. Please try again shortly.', 502);
  }
}
