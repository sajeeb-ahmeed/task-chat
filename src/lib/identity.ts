/** Keep registration and lookup in the same digit-only format: the backend's
 * numeric search branch matches exact stored phone strings, while '+' enters
 * an unsafe name-regex branch. Country codes are retained. */
export function normalizePhone(value: string) {
  return value.replace(/[\s()+-]/g, '');
}

export function normalizeSearch(value: string) {
  const term = value.trim();
  if (/^[+\d\s()-]+$/.test(term)) return normalizePhone(term);
  // The API interprets names as regex patterns. Search people's literal names.
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
