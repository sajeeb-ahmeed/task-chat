# Sajib AI integration

The candidate requested a portfolio-style launcher that reuses the deployed portfolio assistant. This is an optional developer introduction, not a requirement of the chat assignment or an AI participant in Thread conversations.

## Connection

The launcher calls `POST /api/sajib-ai`. The server relays a message and at most 12 user/assistant history entries to the existing `https://sajib.dev.cv/api/sajib-agent.php` endpoint. The deployed `sajib-ai.netlify.app` client uses the same endpoint and message/history contract. An OPTIONS probe from the Thread production origin returned 405 without CORS permission; the server relay avoids a browser cross-origin dependency. No new provider, model selection, API key or environment variable is needed.

The relay uses a fixed destination, JSON validation, a bounded request stream, a 45-second upstream timeout and no-store responses. It only returns reply text. It does not forward Thread tokens, phone numbers, conversations, cookies or upstream recovery identities. The existing backend still processes and may retain assistant messages under its own policy; closing/resetting the panel does not delete backend records.

## Experience and boundaries

- A compact launcher opens a responsive native dialog, with keyboard focus containment, Escape-to-close and focus return.
- Suggested questions populate an editable draft. Enter sends; Shift+Enter inserts a newline; IME composition does not submit.
- Pending requests prevent duplicate submission. Failure restores the draft for an explicit retry and shows an error instead of a fabricated AI reply.
- Replies support Markdown headings, lists, emphasis, code, tables and explicit HTTP(S) links through react-markdown/remark-gfm. Raw HTML, embedded images and unsafe link protocols are not rendered. Copy answer copies the original Markdown. Portfolio history recovery and human support handoff controls are not implemented here.
- Assistant history stays in component memory while navigating within Thread. Reloading starts fresh. Reset clears the local conversation only. There is no shared login or memory synchronization with the portfolio website.
- On narrow chat screens the launcher collapses to an icon and sits above the composer.
- The relay inherits upstream availability, retention and rate limits. It now applies a best-effort limit of 10 requests/minute and 2 concurrent requests per platform-provided client IP per warm server instance. On non-Vercel hosts a shared bucket is used. This is not a distributed quota: cold starts/parallel instances can permit additional requests. No automatic retries are issued.

## Verification

On 7 September 2026, a direct backend probe and a live request through the local relay returned HTTP 200 with portfolio answers. The mobile panel screenshot was visually inspected, and the browser panel displayed a live greeting response.

Added browser coverage for empty-send blocking, suggested prompts, error recovery, message isolation, reset, Escape/focus return, mobile bounds and serious/critical axe violations. Relay unit coverage checks invalid/system-role payload rejection, field allowlisting, suppression of upstream identity and handling of rate limits/empty replies. Existing chat regression tests remain separate from the assistant integration.

Local checks: 11 unit tests passed, 13 browser tests passed (2 opt-in live chat tests skipped), lint, typecheck and production build passed. Production verification is recorded by the repository's CI and manually dispatched production browser workflow.

## Formatting and security review follow-up — 7 September 2026

The initial renderer flattened every reply into a paragraph. Structured Markdown now has dedicated typography, scrollable tables/code and a copy action. The wider panel removes the welcome content once conversation begins. A response no longer forces a reader to the bottom after they have scrolled up; a new-answer button lets them jump explicitly. Desktop and 390px mobile screenshots were inspected.

Security checks found no matching provider/private-key signatures in the inspected source/browser build, tracked source/public/env Git history, or the portfolio and standalone agent's public JavaScript bundles. Only `.env.example` is tracked. `npm audit --omit=dev` reported zero known vulnerabilities, including the new Markdown dependencies. These are scoped checks, not proof that every possible secret is absent; the PHP source, hosting environment, provider account and stored data were not audited.

Hardening: missing/foreign origins and cross-site fetches are rejected, request fields remain allowlisted, upstream redirects are refused, upstream response streams are capped at 256 KiB and displayed replies at 24,000 characters. Burst/concurrency limits include Retry-After responses. Browser headers disable framing, object embedding and unused device permissions, constrain base URLs, suppress MIME sniffing and limit referrers. The CSP does not yet restrict script sources; Markdown safety comes from the renderer and its retained URL sanitation, not from a claimed complete CSP.

The endpoint remains intentionally anonymous. Origin checks are a browser boundary, not authentication; arbitrary HTTP clients can forge an Origin header. For strong cost protection, the shared PHP endpoint needs a distributed rate limit/provider spend cap or an authenticated server-to-server contract. Adding a provider key to the launcher would not solve this and would expose the key. The current change does not modify the deployed PHP backend or rotate provider keys because no exposed key was found in the checked surfaces.

Added regression coverage verifies structure, code/table bounds, copying, HTML/image/unsafe-link suppression, origin rejection and limiter expiry/concurrency. Follow-up local checks: 14 unit tests and 14 browser tests passed (2 opt-in live chat tests skipped), production build passed.

Implementation references: [react-markdown security](https://github.com/remarkjs/react-markdown#security) and [Vercel request headers](https://vercel.com/docs/headers/request-headers).
