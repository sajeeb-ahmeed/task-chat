import { expect, it } from 'vitest';
import { normalizePhone, normalizeSearch } from './identity';
it('preserves the login identifier while keeping the search workaround separate', () => {
  expect(normalizePhone('+880 (170) 000-0000')).toBe('+8801700000000');
  expect(normalizePhone('880 (170) 000-0000')).toBe('8801700000000');
  expect(normalizeSearch('+880 (170) 000-0000')).toBe('8801700000000');
});
it('escapes regex operators in a name search', () => {
  expect(normalizeSearch('Ada (design)')).toBe('Ada \\(design\\)');
  expect(normalizeSearch('A.*')).toBe('A\\.\\*');
});
