import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Session } from '../src/lib/types';

// Explicit opt-in: creates isolated synthetic users/messages on the assignment backend.
test.skip(
  process.env.LIVE_CHAT_TESTS !== '1',
  'Set LIVE_CHAT_TESTS=1 to exercise the real assignment API.',
);
const origin = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://frontend-task-chatapp.onrender.com';

test('three users: direct and group delivery, pagination, scroll anchoring, drafts and reconnect', async ({
  browser,
  request,
}) => {
  test.setTimeout(240000);
  const stamp = Date.now().toString();
  const sessions: Session[] = [];
  for (let i = 0; i < 3; i++) {
    const response = await request.post(`${origin}/api/auth/login`, {
      data: {
        name: `Thread Test ${stamp} ${['Ada', 'Ben', 'Cleo'][i]}`,
        phone: `1${stamp.slice(-11)}${i}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    sessions.push(await response.json());
  }
  async function login(page: Page, session: Session) {
    await page.goto('/login');
    await page.getByLabel('Your name').fill(session.user.name);
    await page.getByLabel('Phone number').fill(session.user.phone);
    await page.getByRole('button', { name: 'Let’s talk' }).click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByText('Connected. Ready when you are.')).toBeVisible();
  }
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [ada, ben, cleo] = await Promise.all(contexts.map((c) => c.newPage()));
  try {
    await login(ada, sessions[0]);
    await login(ben, sessions[1]);
    await login(cleo, sessions[2]);
    await ada.getByRole('button', { name: 'New conversation', exact: true }).click();
    await ada.getByLabel('Search people by name or phone').fill('+' + sessions[1].user.phone);
    await ada
      .getByRole('dialog')
      .getByRole('button', { name: new RegExp(sessions[1].user.name) })
      .click();
    await expect(ada.getByLabel('Write a message')).toBeVisible();
    await expect(ada.getByText('Every good thread starts')).toBeVisible();
    await ada.getByLabel('Write a message').fill('   ');
    await expect(ada.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
    await ada.getByLabel('Write a message').fill('Hello from Ada, delivered live.');
    await ada.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(
      ada.locator('.message-bubble').filter({ hasText: 'Hello from Ada, delivered live.' }),
    ).toHaveCount(1);
    await ben.getByRole('button', { name: new RegExp(sessions[0].user.name) }).click();
    await expect(
      ben.locator('.message-bubble').filter({ hasText: 'Hello from Ada, delivered live.' }),
    ).toHaveCount(1);
    const directUrl = ada.url();
    const id = directUrl.split('/').at(-1)!;
    await ben.getByLabel('Write a message').fill('Hello Ada! Replying without a refresh.');
    await ben.getByLabel('Write a message').press('Enter');
    await expect(
      ada.locator('.message-bubble').filter({ hasText: 'Replying without a refresh' }),
    ).toHaveCount(1);
    await expect(
      ben.locator('.message-bubble').filter({ hasText: 'Replying without a refresh' }),
    ).toHaveCount(1);

    // Enough genuine history to cross a pagination boundary and scroll the viewport.
    for (let offset = 0; offset < 36; offset += 6) {
      await Promise.all(
        Array.from({ length: 6 }, (_, j) =>
          request
            .post(`${origin}/api/messages`, {
              headers: { Authorization: `Bearer ${sessions[1].token}` },
              data: {
                conversationId: id,
                text: `History ${String(offset + j).padStart(2, '0')}: a thoughtful conversation worth revisiting.`,
              },
            })
            .then((r) => expect(r.ok()).toBeTruthy()),
        ),
      );
    }
    await ada.reload();
    await expect(ada.locator('[data-message-id]')).toHaveCount(30);
    const history = ada.getByLabel('Message history');
    await history.evaluate((el) => {
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll'));
    });
    const anchor = await ada.locator('[data-message-id]').first().getAttribute('data-message-id');
    const beforeY = await ada
      .locator(`[data-message-id="${anchor}"] .message-row`)
      .evaluate((el) => el.getBoundingClientRect().top);
    await ada.getByRole('button', { name: 'Load earlier messages' }).click();
    await expect(ada.locator('[data-message-id]')).toHaveCount(38);
    const afterY = await ada
      .locator(`[data-message-id="${anchor}"] .message-row`)
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(afterY - beforeY)).toBeLessThan(10);
    const scrollTop = await history.evaluate((el) => el.scrollTop);
    await ben.getByLabel('Write a message').fill('A new message while you read.');
    await ben.getByLabel('Write a message').press('Enter');
    await expect(ada.getByRole('button', { name: '1 new message', exact: true })).toBeVisible();
    expect(Math.abs((await history.evaluate((el) => el.scrollTop)) - scrollTop)).toBeLessThan(5);
    await ada.getByRole('button', { name: '1 new message', exact: true }).click();
    await expect(
      ada.locator('.message-bubble').filter({ hasText: 'A new message while you read.' }),
    ).toBeInViewport();

    await ada.getByLabel('Write a message').fill('An unfinished thought, just for Ben.');
    await ada.getByRole('button', { name: 'New conversation', exact: true }).click();
    await ada.getByRole('button', { name: 'Create a group', exact: true }).click();
    await ada.getByLabel('Group name').fill(`Sunday Club ${stamp}`);
    await ada.getByLabel('Search people by name or phone').fill(`Thread Test ${stamp}`);
    await ada
      .getByRole('dialog')
      .getByRole('button', { name: new RegExp(sessions[1].user.name) })
      .click();
    await expect(ada.getByRole('button', { name: 'Create group', exact: true })).toBeDisabled();
    await ada
      .getByRole('dialog')
      .getByRole('button', { name: new RegExp(sessions[2].user.name) })
      .click();
    await ada.getByRole('button', { name: 'Create group', exact: true }).click();
    await expect(ada.getByRole('heading', { name: `Sunday Club ${stamp}` })).toBeVisible();
    await expect(ada.getByLabel('Write a message')).toHaveValue('');
    await ada.getByRole('button', { name: 'View group members' }).click();
    await expect(ada.locator('.members-strip')).toContainText(sessions[2].user.name);
    await ada.getByLabel('Write a message').fill('Hello to the whole Sunday Club.');
    await ada.getByLabel('Write a message').press('Enter');
    for (const page of [ben, cleo]) {
      await page.getByRole('button', { name: new RegExp(`Sunday Club ${stamp}`) }).click();
      await expect(
        page.locator('.message-bubble').filter({ hasText: 'Hello to the whole Sunday Club.' }),
      ).toHaveCount(1);
    }
    await ada.goto(directUrl);
    await expect(ada.getByLabel('Write a message')).toHaveValue(
      'An unfinished thought, just for Ben.',
    );

    await contexts[0].setOffline(true);
    await ben.getByRole('button', { name: new RegExp(sessions[0].user.name) }).click();
    await ben.getByLabel('Write a message').fill('This arrived while you were away.');
    await ben.getByLabel('Write a message').press('Enter');
    await expect(
      ben.locator('.message-bubble').filter({ hasText: 'This arrived while you were away.' }),
    ).toBeVisible();
    await contexts[0].setOffline(false);
    await expect(
      ada.locator('.message-bubble').filter({ hasText: 'This arrived while you were away.' }),
    ).toHaveCount(1, { timeout: 45000 });

    const audit = await new AxeBuilder({ page: ada })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
    await ada.screenshot({ path: 'tmp/chat-live-desktop.png', fullPage: true });
    await ada.setViewportSize({ width: 390, height: 844 });
    await expect(
      ada.getByRole('button', { name: 'Back to conversations', exact: true }),
    ).toBeVisible();
    expect(await ada.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await ada.screenshot({ path: 'tmp/chat-live-mobile.png', fullPage: true });
    await ada.getByRole('button', { name: 'Back to conversations', exact: true }).click();
    await ada.getByRole('button', { name: 'Sign out' }).click();
    await expect(ada).toHaveURL(/\/login$/);
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});
