import { expect, it } from 'vitest';
import { formatAIResponse } from './ai-response-format';

it('converts the actual portfolio protocol including Bengali paragraphs', () => {
  expect(
    formatAIResponse(
      'SECTION: যোগাযোগ\nPARA: ইমেইল ব্যবহার করুন।\nPARA: আরও কিছু জানতে চাইলে বলুন।\nITEM: CRM\nITEM: AI',
    ),
  ).toBe('## যোগাযোগ\n\n\nইমেইল ব্যবহার করুন।\n\n\nআরও কিছু জানতে চাইলে বলুন।\n\n\n- CRM\n- AI');
});
it('keeps protocol-like text inside Markdown and protocol code blocks intact', () => {
  const markdown = '```text\nPARA: literal\nITEM: literal\n```';
  expect(formatAIResponse(markdown)).toBe(markdown);
  expect(formatAIResponse('CODE_START: text\nPARA: literal\n```\nCODE_END')).toBe(
    '````text\nPARA: literal\n```\n````',
  );
});
it('preserves ordinary prose and safely closes an unfinished protocol code block', () => {
  expect(formatAIResponse('This mentions PARA: as a value.')).toBe(
    'This mentions PARA: as a value.',
  );
  expect(formatAIResponse('CODE_START: ts\nconst answer = 42;')).toBe(
    '```ts\nconst answer = 42;\n```',
  );
});
