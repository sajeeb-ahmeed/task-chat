import { expect, it } from 'vitest';
import { normalizePhone, normalizeSearch } from './identity';
it('uses the same exact numeric phone for registration and plus-formatted lookup', () => {
  expect(normalizePhone('+880 (170) 000-0000')).toBe('8801700000000');
  expect(normalizeSearch('+880 (170) 000-0000')).toBe('8801700000000');
});
it('escapes regex operators in a name search', () => {
  expect(normalizeSearch('Ada (design)')).toBe('Ada \\(design\\)');
  expect(normalizeSearch('A.*')).toBe('A\\.\\*');
});
