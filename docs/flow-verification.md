# Required flows: implementation and verification

Review date: 7 September 2026. Scope: the three parts of the supplied Frontend Developer take-home assignment. The application uses the supplied API directly; deterministic API fixtures are used only in error-state tests.

## Flow checklist

| Flow                                  | Implementation and verification                                                                                                                                                                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Landing to login                   | Landing presents the chat feature and login links. Its sample interaction preserves the reading moment and jumps to the arriving message when selected. Browser coverage: `experience.spec.ts`.                                                                         |
| 2. Login/new account                  | Phone/name input, validation, loading feedback, automatic backend registration and protected-route redirect. `experience.spec.ts` checks malformed input; live suites create synthetic accounts and sign in through the UI.                                             |
| 3. Existing account and reload        | Both plus-prefixed and digit-only identities retain their user IDs. `phone-identity.spec.ts` checks exact request input; `live-phone-identity.spec.ts` checks the real API and session restoration.                                                                     |
| 4. Search/start direct chat           | Name and formatted-phone searches lead to a direct conversation; no-result state and keyboard dialog close/focus restoration are tested. Plus-prefixed stored users need name lookup due to the backend limitation.                                                     |
| 5. Create group                       | Select at least two other users, supply a name, create a group, display members, and deliver a group message to all three sessions. Covered by `live-chat.spec.ts`.                                                                                                     |
| 6. History and presentation           | Chronological messages, distinct own/other bubbles, group sender names and timestamps. The live test crosses a 30-message page boundary, verifies 38 unique messages and preserves the visible row.                                                                     |
| 7. Compose/send                       | Whitespace-only messages are disabled; real sends and Enter submission succeed without duplicate REST/socket echoes. The source supports Shift+Enter multiline input.                                                                                                   |
| 8. Incoming realtime messages         | Separate sessions receive direct replies and group messages without reload. Socket authentication and reconnect reconciliation use the supplied service.                                                                                                                |
| 9. Reading position                   | Loading earlier history preserves the anchor; incoming messages while reading do not force a jump. The new-message action brings the latest message into view. Covered by the live journey.                                                                             |
| 10. Loading/error/retry               | New coverage holds a history request to verify loading, returns an access error, then verifies retry recovery. Search errors hide raw server internals and recover on retry.                                                                                            |
| 11. Failed or uncertain send          | A definite rejection retains the draft and allows an explicit retry; success renders once and clears the composer. A network-ambiguous send blocks blind retries until the user checks/unlocks it.                                                                      |
| 12. Navigation and session boundaries | Drafts stay with their conversation; mobile back navigation and logout work; expired sessions clear stale conversations. Both real and fixture suites cover these flows.                                                                                                |
| 13. Offline/reconnect                 | A message sent while one session is offline is reconciled after reconnect. The app visibly falls back to periodic checking while disconnected.                                                                                                                          |
| 14. Responsive/accessibility          | Mobile landing/login and chat width checked; axe checks run on representative states. Desktop/mobile screenshot inspection was performed in the prior QA and phone-fix pass. This is Chromium viewport coverage, not a physical-device or complete accessibility audit. |

## Deliverables

- Own API documentation was the first standalone commit: `e473bcd`, before implementation.
- [API documentation](api.md) records request/response shapes, statuses, cursor behavior and socket payloads.
- [Backend issue notes](backend-issues.md) describe what was observed, how the frontend handles it, and what remains limited.
- README provides setup instructions, stack, architecture/design reasoning, AI disclosure, trade-offs and improvements with more time.
- Landing: https://task-chat-mu.vercel.app/
- Chat: https://task-chat-mu.vercel.app/chat
- Repository: https://github.com/sajeeb-ahmeed/task-chat

The PDF does not mandate a visual mockup or palette. Part 2 explicitly leaves visual direction to the candidate. Group administration routes are additional Swagger capabilities, not part of the PDF's explicit group creation/messaging checklist.

## Verification boundaries

Final recheck: formatting, lint, route type generation/TypeScript and production build all passed; eight unit tests passed; all thirteen opt-in Chromium browser tests passed in approximately 1.3 minutes against the local frontend with the real backend for the live journeys. The three added recovery-flow tests also passed independently before the full rerun. No new application defect was found in these exercised flows. The earlier QA snapshot remains in [the dated review](qa-review-2026-09-07.md).

The prior deployed-app run passed all ten then-existing browser tests: https://github.com/sajeeb-ahmeed/task-chat/actions/runs/34096725526 . The new recovery cases extend test coverage without changing application behavior.

No supplied-backend fixes, Firefox/WebKit or real-device coverage, evaluator repository access, or recruiter submission are claimed. Before submission, verify repository access from a signed-out browser. The document's deadline and submission destination need external confirmation before submission.
