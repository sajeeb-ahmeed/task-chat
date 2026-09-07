/** Remove presentation separators, but preserve '+' because the API treats
 * plus-prefixed and digit-only login identifiers as distinct accounts. */
export function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, '');
}

export function normalizeSearch(value: string) {
  const term = value.trim();
  // Search alone needs digits: '+' enters the backend's broken regex branch.
  // This workaround must never be applied to a login identifier.
  if (/^[+\d\s()-]+$/.test(term)) return normalizePhone(term).replace(/\+/g, '');
  // The API interprets names as regex patterns. Search people's literal names.
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
