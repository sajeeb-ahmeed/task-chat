import type { Conversation, Message, MessagePage, Session, User } from './types';
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN || 'https://frontend-task-chatapp.onrender.com').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(message: string, public status: number, public code: string) { super(message); this.name = 'ApiError'; }
}
export async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_ORIGIN}/api${path}`, {
      ...init, signal: init?.signal || AbortSignal.timeout(25000),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'NETWORK_ERROR');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const code = body?.error?.code || 'REQUEST_FAILED';
    if (token && (response.status === 401 || code === 'NO_TOKEN')) window.dispatchEvent(new Event('thread:session-expired'));
    throw new ApiError(response.status >= 500 ? 'The chat server is having trouble. Please try again shortly.' : body?.error?.message || 'Something went wrong. Please try again.', response.status, code);
  }
  return body as T;
}
const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });
export const api = {
  login: (phone: string, name: string) => request<Session>('/auth/login', undefined, post({ phone, name })),
  me: (token: string) => request<User>('/auth/me', token),
  conversations: (token: string, signal?: AbortSignal) => request<{ data: Conversation[] }>('/conversations', token, { signal }),
  search: (token: string, q: string, signal?: AbortSignal) => request<User[]>(`/users/search?q=${encodeURIComponent(q)}`, token, { signal }),
  direct: (token: string, userId: string) => request<{ _id: string }>('/conversations', token, post({ userId })),
  group: (token: string, name: string, participantIds: string[]) => request<Conversation>('/conversations/group', token, post({ name, participantIds })),
  history: (token: string, id: string, before?: string, signal?: AbortSignal) => request<MessagePage>(`/conversations/${encodeURIComponent(id)}/messages?limit=30${before ? `&before=${encodeURIComponent(before)}` : ''}`, token, { signal }),
  send: (token: string, conversationId: string, text: string) => request<Message>('/messages', token, post({ conversationId, text: text.trim() })),
};
