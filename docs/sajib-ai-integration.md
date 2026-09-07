# Sajib AI integration

The candidate requested a portfolio-style launcher that reuses the deployed portfolio assistant. This is an optional developer introduction, not a requirement of the chat assignment or an AI participant in Thread conversations.

## Connection

The launcher calls `POST /api/sajib-ai`. The server relays a message and at most 12 user/assistant history entries to the existing `https://sajib.dev.cv/api/sajib-agent.php` endpoint. The deployed `sajib-ai.netlify.app` client uses the same endpoint and message/history contract. An OPTIONS probe from the Thread production origin returned 405 without CORS permission; the server relay avoids a browser cross-origin dependency. No new provider, model selection, API key or environment variable is needed.

The relay uses a fixed destination, JSON validation, a bounded request stream, a 45-second upstream timeout and no-store responses. It only returns reply text. It does not forward Thread tokens, phone numbers, conversations, cookies or upstream recovery identities. The existing backend still processes and may retain assistant messages under its own policy; closing/resetting the panel does not delete backend records.

## Experience and boundaries

- A compact launcher opens a responsive native dialog, with keyboard focus containment, Escape-to-close and focus return.
- Suggested questions populate an editable draft. Enter sends; Shift+Enter inserts a newline; IME composition does not submit.
- Pending requests prevent duplicate submission. Failure restores the draft for an explicit retry and shows an error instead of a fabricated AI reply.
- Replies render as text, never executable HTML. Rich Markdown, portfolio history recovery and human support handoff controls are not implemented here.
- Assistant history stays in component memory while navigating within Thread. Reloading starts fresh. Reset clears the local conversation only. There is no shared login or memory synchronization with the portfolio website.
- On narrow chat screens the launcher collapses to an icon and sits above the composer.
- The relay inherits upstream availability, retention and rate limits. Server-origin traffic may share an upstream quota; there is no additional distributed per-user rate limiter in this assignment. No automatic retries are issued.

## Verification

On 7 September 2026, a direct backend probe and a live request through the local relay returned HTTP 200 with portfolio answers. The mobile panel screenshot was visually inspected, and the browser panel displayed a live greeting response.

Added browser coverage for empty-send blocking, suggested prompts, error recovery, message isolation, reset, Escape/focus return, mobile bounds and serious/critical axe violations. Relay unit coverage checks invalid/system-role payload rejection, field allowlisting, suppression of upstream identity and handling of rate limits/empty replies. Existing chat regression tests remain separate from the assistant integration.

Local checks: 11 unit tests passed, 13 browser tests passed (2 opt-in live chat tests skipped), lint, typecheck and production build passed. Production verification is recorded by the repository's CI and manually dispatched production browser workflow.
