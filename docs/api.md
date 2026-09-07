# Chat API: observed contract

Written before feature implementation. Source: https://frontend-task-chatapp.onrender.com/docs/ . Live REST observations: 7 September 2026, using three isolated synthetic QA users. JWTs and session files are excluded from Git. Responses below use illustrative IDs.

## Connection and authentication

- REST base: `https://frontend-task-chatapp.onrender.com/api`
- JSON request bodies; protected routes require `Authorization: Bearer <token>`.
- Socket.io origin: `https://frontend-task-chatapp.onrender.com` (NOT `/api`). Handshake: `{ auth: { token } }`.
- Login has no password/OTP verification. This is an assignment backend, not a production identity system. Use test identities, not sensitive conversations.
- Dates are UTC ISO 8601 strings; render them in the viewer's locale.

## Core endpoints (live verified)

| Method / path | Input | Observed success |
| --- | --- | --- |
| POST `/auth/login` | `{ phone: string, name: string }` | 200 `{ token, user: { _id, name, phone, createdAt } }`; new numbers auto-register |
| GET `/auth/me` | Bearer token | 200 `{ _id, name, phone, createdAt }` (no user wrapper) |
| GET `/users/search?q=...` | URL-encoded name or phone | 200 `[{ _id, name, phone }]`; includes the current user |
| GET `/conversations` | Bearer token | 200 `{ data: Conversation[] }` |
| POST `/conversations` | `{ userId }` | 200 `{ _id, participants: string[], createdAt }`; repeating the pair returns the same conversation |
| POST `/conversations/group` | `{ name, participantIds: string[] }` | 201 populated group; participantIds excludes the creator, needs at least two distinct other users |
| GET `/conversations/{id}/messages?limit=30&before={messageId}` | Optional integer limit and message ID cursor | 200 `{ messages: Message[], hasMore: boolean }`, newest first |
| POST `/messages` | `{ conversationId, text }` | 200 `Message` |

### Conversation list shape

```ts
type User = { _id: string; name: string; phone: string; createdAt?: string };
type Message = {
  _id: string; conversation: string; sender: string;
  text: string; createdAt: string;
};
type Conversation = {
  _id: string; type: 'direct' | 'group'; updatedAt: string;
  lastMessage: Partial<Pick<Message, 'text' | 'sender' | 'createdAt'>>;
  // direct only:
  participant?: User;
  // group only:
  name?: string; participants?: User[]; admins?: string[]; createdBy?: string;
};
```

Group creation additionally returns `createdAt` and `updatedAt`. A new conversation's `lastMessage` is `{}`, not null. Direct creation returns participant IDs rather than the list's populated `participant`: refetch the list after creating a conversation.

### Pagination

Use the oldest message's `_id` as `before`, not its timestamp. The observed ID cursor is **inclusive**: the boundary message appears again. Deduplicate by `_id`, sort oldest-first for display, retain the oldest raw page item for the next cursor. Stop if `hasMore` is false or the cursor fails to advance. Preserve the viewport when older items are prepended.

## Errors and inconsistencies (observed)

Error envelope: `{ error: { message: string, code: string, details?: { path: string, message: string }[] } }`.

| Case | Status / code | Frontend handling |
| --- | --- | --- |
| Missing login fields | 400 `VALIDATION_ERROR` | Validate form and display useful field feedback |
| Missing token | 400 `NO_TOKEN` | Treat as auth failure despite unusual status |
| Invalid token | 401 `INVALID_TOKEN` | Clear session/cache and return to login |
| History accessed by non-member | 403 `FORBIDDEN` | Show access error; never retain another user's cache |
| Group with only one other person | 400 `VALIDATION_ERROR` | Require two selected other users |
| Whitespace-only message | **200 accepted** | Trim and reject empty text on the client |
| Search with a leading `+` | 500, numeric error code `51091` | Canonicalize phone numbers to country code + digits (no `+`) at both login and search |
| All-digit search | Exact phone match, not partial name match | Use the complete number; use a name query for discovery |
| ISO date passed as `before` | 500 `SERVER_ERROR` with ObjectId cast detail | Only send message IDs; do not display raw server internals |
| GET `/api/health` | 404 `NOT_FOUND` | Do not rely on the documented health route |

The request-focused Swagger omits response schemas/status codes. These observations fill that gap, rather than guessing conventional envelopes/status codes. No server-side idempotency key is documented; a timed-out send can have succeeded. Do not automatically resend a message on timeout.

### Phone and name search workaround

Live tests showed numeric-only `q` performs exact phone matching, while other input enters a name-regex branch. A leading plus sign makes that regex invalid. The frontend keeps country codes but strips `+`, spaces, parentheses, and hyphens before registration and phone lookup; a formatted `+880 ...` input therefore works for accounts created through Thread. Literal name searches escape regex operators. Existing backend accounts stored with a leading `+` cannot be found through its numeric branch: find those users by name. Do not silently impersonate an existing account via login to work around lookup. The unfiltered endpoint is capped at 50 results, so downloading the directory is not a correct fallback.

## Socket events

Live verified: a REST send from one synthetic user reaches another connected user via `message:new`. Unlike the REST object, the event is `{ id, conversation, sender, text, createdAt }`, with a numeric millisecond timestamp. Normalize `id` to `_id` and the timestamp to ISO before merging. `conversation:updated` is documented in Swagger; the app invalidates the conversation list on that event.

| Direction | Event | Contract |
| --- | --- | --- |
| client → server | `message:send` | `{ conversationId, text }`, optional ack; app uses REST sending instead |
| server → client | `message:new` | New message; normalize/merge by server ID |
| server → client | `conversation:updated` | Group changed; invalidate conversations |

Connect once per authenticated session, remove listeners/disconnect on logout. Reconcile history and conversations on connection/reconnection and tab focus. REST replies and socket echoes must not render duplicates.

## Additional group endpoints (documented, outside required UI scope)

These requests are described by Swagger; response/status behavior is not yet live verified.

| Method / path | Body | Permission |
| --- | --- | --- |
| POST `/conversations/{id}/participants` | `{ userIds: string[] }` | Admin adds members |
| DELETE `/conversations/{id}/participants/{userId}` | none | Admin removes; member may remove self to leave |
| POST `/conversations/{id}/admins` | `{ userId }` | Admin promotes existing member |
| PATCH `/conversations/{id}` | `{ name }` | Admin renames group |

Keep the provided routes. A frontend adapter is sufficient to normalize their differing response shapes; a replacement backend would obscure whether the supplied API is correctly integrated.
