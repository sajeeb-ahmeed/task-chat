# Thread: UI refinement

The redesign keeps the real API, routes, authentication and chat behavior. It changes visual hierarchy and interaction clarity across landing, login, workspace and conversation picker.

## Direction and references

Reviewed current first-party references on 7 September 2026:

- [Linear's March 2026 interface refresh](https://linear.app/now/behind-the-latest-design-refresh): reduce competing navigation emphasis and make controls more consistent.
- [Vercel Geist typography](https://vercel.com/geist/typography): establish distinct heading, body, label and secondary-text sizes.

These inform principles, not a claim that one palette is universally fashionable. Thread uses white/ink surfaces, a restrained blue accent and Geist typography. No external product is copied pixel-for-pixel.

## Changes by surface

1. **Landing:** an asymmetric headline/introduction, larger product preview, concise feature cards and an attention-focused section. The sample chat remains explicitly labeled and interactive. Removed ornamental mock graphics; use library icons and the actual sample component.
2. **Login:** clearer hierarchy, larger fields and helper text, a quieter navy brand panel, and expandable guidance for existing account identifiers. The phone identity fix and demo disclosure remain intact.
3. **Chat:** neutral navigation, clearer selected conversations/filters, stronger sent/received distinction, larger timestamps and message text, more usable controls, and a cleaner composer. Mobile input text is 16px; the send control is 44px and respects bottom safe-area spacing.
4. **Conversation picker:** larger labels/results, consistent surfaces and explicit pressed states for mode and participant selection. Existing focus restoration and native dialog behavior remain.

The visual system is applied in `src/app/refinement.css` after the existing feature/layout stylesheet. This keeps established responsive visibility and scrolling behavior intact; subsequent changes should keep shared visual rules in this layer rather than scatter new overrides across components.

## Verification

- In-app browser inspection of the existing landing, login and workspace before implementation, followed by desktop/mobile review of the revised surfaces and the account-help disclosure.
- Eight unit tests and all thirteen browser tests passed after the main redesign, including real direct/group chat, pagination, scroll anchoring, reconnect and phone identity regression coverage.
- Final landing sizing adjustments were followed by a fresh three-test experience run, including mobile axe checks and the interactive preview.
- Visual review found that a clipped preview could pass the old document-width check. The test now checks the actual preview/button bounds and exercises the preview at mobile width; sizing was corrected before delivery.
- Lint, route types and production build passed during the implementation pass. CI verifies the committed state.

Screenshots in `docs/screenshots/` show the revised landing and login. Chat screenshots from the live test are kept in ignored local test output because they contain synthetic test-session content. Desktop browser and mobile viewport checks do not replace a full real-device, screen-reader or cross-browser audit.

The supplied backend's known phone-search limitation is unchanged and remains in [backend issue notes](backend-issues.md).
