import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('portfolio response protocol renders paragraphs, headings, lists and literal code', async ({
  page,
}) => {
  const reply =
    'SECTION: যোগাযোগ\nPARA: ইমেইল ব্যবহার করুন।\nPARA: আরও জানতে চাইলে বলুন।\nITEM: CRM platform\nITEM: AI assistant\nCODE_START: text\nPARA: literal inside code\nCODE_END';
  await page.route('**/api/sajib-ai', (route) => route.fulfill({ json: { reply } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Sajib AI' }).click();
  await page.getByRole('textbox', { name: 'Message Sajib AI' }).fill('How do I contact Sajib?');
  await page.getByRole('button', { name: 'Send to Sajib AI' }).click();
  const answer = page.locator('.sajib-ai-markdown');
  await expect(answer.getByRole('heading', { name: 'যোগাযোগ' })).toBeVisible();
  await expect(answer.locator('p')).toHaveText(['ইমেইল ব্যবহার করুন।', 'আরও জানতে চাইলে বলুন।']);
  await expect(answer.getByRole('listitem')).toHaveCount(2);
  await expect(answer.locator('pre code')).toHaveText('PARA: literal inside code\n');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tmp/ai-protocol-mobile.png' });
});

test('connection failure retains the draft and offers a separate reachable destination', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/sajib-ai', (route) => {
    calls++;
    return route.abort('timedout');
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Sajib AI' }).click();
  const input = page.getByRole('textbox', { name: 'Message Sajib AI' });
  await input.fill('How do I contact Sajib?');
  await page.getByRole('button', { name: 'Send to Sajib AI' }).click();
  const error = page.getByRole('dialog').getByRole('alert');
  await expect(error).toContainText('Could not reach this site');
  await expect(input).toHaveValue('How do I contact Sajib?');
  await expect(error.getByRole('link')).toHaveAttribute('href', 'https://sajib.dev.cv/');
  expect(calls).toBe(1);
});

test('structured replies render safely with lists, code, tables and copy', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const reply =
    '## Projects\n\n**Selected work** with `TypeScript`.\n\n- CRM platform\n- AI assistant\n\n```ts\nconst answer = 42;\n```\n\n| Project | Stack |\n| --- | --- |\n| CRM | React |\n\n[Portfolio](https://sajib.dev.cv/)\n\n[Unsafe](javascript:alert(1))\n\n<img src="https://example.com/tracker" onerror="alert(1)">';
  await page.route('**/api/sajib-ai', (route) => route.fulfill({ json: { reply } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Sajib AI' }).click();
  const dialog = page.getByRole('dialog', { name: 'Sajib AI' });
  await page.getByRole('textbox', { name: 'Message Sajib AI' }).fill('Show structured projects');
  await page.getByRole('button', { name: 'Send to Sajib AI' }).click();
  await expect(dialog.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  await expect(dialog.getByRole('listitem')).toHaveCount(2);
  await expect(dialog.locator('pre code')).toHaveText('const answer = 42;\n');
  await expect(dialog.getByRole('table')).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Portfolio', exact: true })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  await expect(dialog.locator('img, script, a[href^="javascript:"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Copy answer' }).click();
  expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(
    reply,
  );
  await page.screenshot({ path: 'tmp/ai-structured-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: 'tmp/ai-structured-mobile.png' });
});

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
