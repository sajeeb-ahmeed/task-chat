# Architecture notes

## Request and event flow

```text
Login → REST JWT → tab-scoped session → query cache scoped by user ID
                                ├→ conversation list + paginated history (REST)
                                └→ one Socket.io connection per mounted workspace

Composer → one REST POST → normalized message ─┐
Socket message:new → normalize id/date ────────┼→ deduplicate by server ID → chronological list
History pages → remove inclusive boundaries ─┘
```

Conversation creation refetches the canonical conversation list instead of assuming the POST response has the same populated fields. Cache keys include the current user; logout clears the query client and closes the socket. Socket connection/reconnection invalidates history and conversations; focus refetching and disconnected polling provide recovery paths. Navigating between page routes can briefly reconnect the workspace socket; REST history fills that gap.

History pages and newly received messages use separate query entries. This prevents a history refetch from overwriting a socket event received during that request. A map deduplicates `_id`s and a stable chronological sort resolves REST/socket order differences. `before` is the oldest raw page ID; a non-advancing cursor stops fetching.

## UI ownership

- `Providers`: query client, session restoration, expired-session event handling.
- `ChatWorkspace`: conversations, filters, selected route, creation dialog and socket lifecycle.
- `ChatPanel`: history, composer, scroll anchoring, send feedback and group-member disclosure.
- `NewConversation`: debounced search, selection and required group validation.
- `ChatPreview`: local demonstration only; no fake messages are injected into real conversations.

## Failure policy

- Abortable queries prevent stale search/conversation requests from winning navigation races.
- Authentication failures are handled by semantic error code as well as HTTP status.
- Server internals are replaced by a useful generic error; validation errors stay actionable.
- A timed-out send retains the draft and requires checking the conversation before unlocking another send. No automatic POST retries.
- Token and drafts are tab-scoped; no session credentials are committed or embedded into the build.

## Deliberate limits

The landing page uses Google Fonts with local system fallbacks. Long histories are loaded progressively without virtualization. The realtime event cache is not yet bounded for multi-day sessions. `sessionStorage` is pragmatic for this browser-to-API assignment, but real production authentication should use verified identity and an appropriate secure session design with the backend. Backend member/admin mutation endpoints are out of the required UI scope.
