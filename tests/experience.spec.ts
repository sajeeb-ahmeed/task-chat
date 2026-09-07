import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing preview preserves the reading moment and returns to the new message', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Good conversations/ })).toBeVisible();
  await page.getByRole('button', { name: 'Send a little hello' }).click();
  await expect(page.getByText('Take your time. Your place is saved.')).toBeVisible();
  await page.getByRole('button', { name: '1 new message' }).click();
  await expect(page.getByText('Count me in. Same corner café?')).toBeInViewport();
  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expect(page.getByRole('button', { name: 'Send a little hello' })).toBeVisible();
  await page.screenshot({ path: 'tmp/landing-desktop.png', fullPage: true });
});

test('mobile landing and login fit the viewport and have no serious accessibility violations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/login']) {
    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      audit.violations.filter((v) => ['serious', 'critical'].includes(v.impact || '')),
      JSON.stringify(
        audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        null,
        2,
      ),
    ).toEqual([]);
    await page.screenshot({
      path: `tmp/${path === '/' ? 'landing' : 'login'}-mobile.png`,
      fullPage: true,
    });
  }
});

test('unauthenticated chat redirects and malformed phone is rejected without a request', async ({
  page,
}) => {
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Your name').fill('Test person');
  await page.getByLabel('Phone number').fill('123');
  await page.getByRole('button', { name: 'Let’s talk' }).click();
  await expect(page.locator('.error-box[role=alert]')).toContainText('7–15 digits');
});
