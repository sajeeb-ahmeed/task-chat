import { test, expect } from '@playwright/test';
import type { Session } from '../src/lib/types';

test.skip(process.env.LIVE_CHAT_TESTS !== '1', 'Creates synthetic identities on the real API.');

test('existing plus and digit-only accounts retain their identities through UI login', async ({
  browser,
  request,
}) => {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://frontend-task-chatapp.onrender.com';
  const digits = `1${Date.now().toString().slice(-11)}`;
  const ids: string[] = [];
  for (const phone of [`+${digits}`, digits]) {
    const response = await request.post(`${origin}/api/auth/login`, {
      data: { phone, name: `Phone Regression ${phone}` },
    });
    expect(response.ok()).toBeTruthy();
    const original: Session = await response.json();
    ids.push(original.user._id);
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto('/login');
      await page.getByLabel('Your name').fill(original.user.name);
      await page.getByLabel('Phone number').fill(phone);
      await page.getByRole('button', { name: 'Let’s talk' }).click();
      await expect(page).toHaveURL(/\/chat$/);
      expect(
        await page.evaluate(() => JSON.parse(sessionStorage.getItem('thread.session')!).user._id),
      ).toBe(original.user._id);
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Conversations.' })).toBeVisible();
    } finally {
      await context.close();
    }
  }
  expect(new Set(ids).size).toBe(2);
});
