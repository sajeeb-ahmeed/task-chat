import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('AI launcher isolates messages, recovers failures and restores focus', async ({ page }) => {
  const payloads: { message: string; history: unknown[] }[] = [];
  await page.route('**/api/sajib-ai', async (route) => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({
      status: payloads.length === 1 ? 502 : 200,
      json:
        payloads.length === 1
          ? { error: 'Sajib AI is unavailable. Please try again.' }
          : { reply: 'Sajib builds full-stack products.' },
    });
  });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Open Sajib AI' });
  await launcher.click();
  const dialog = page.getByRole('dialog', { name: 'Sajib AI' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send to Sajib AI' })).toBeDisabled();
  await page.getByRole('button', { name: 'Show me Sajib’s projects' }).click();
  const input = page.getByRole('textbox', { name: 'Message Sajib AI' });
  await input.press('Enter');
  await expect(dialog.getByRole('alert')).toContainText('unavailable');
  await expect(input).toHaveValue('Show me Sajib’s projects');
  await input.press('Enter');
  await expect(dialog.getByText('Sajib builds full-stack products.')).toBeVisible();
  expect(payloads).toHaveLength(2);
  expect(Object.keys(payloads[1]).sort()).toEqual(['history', 'message']);
  expect(payloads[1].history).toHaveLength(1);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(dialog.getByText('Sajib builds full-stack products.')).toBeVisible();
  await page.getByRole('button', { name: 'New AI conversation' }).click();
  await expect(dialog.getByText('Sajib builds full-stack products.')).toHaveCount(0);
});

test('mobile AI dialog fits and has no serious accessibility violations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Sajib AI' }).click();
  const dialog = page.getByRole('dialog', { name: 'Sajib AI' });
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  const audit = await new AxeBuilder({ page }).include('#sajib-ai-dialog').analyze();
  expect(audit.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''))).toEqual(
    [],
  );
  await page.screenshot({ path: 'tmp/sajib-ai-mobile.png' });
});
