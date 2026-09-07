import { test, expect, type Page } from '@playwright/test';

async function mockChat(page: Page, mode: 'failure' | 'empty' | 'unauthorized' = 'failure') {
  const user = { _id: 'user-a', name: 'Alex Morgan', phone: '15550001111' };
  const friend = { _id: 'user-b', name: 'Jamie Chen', phone: '15550002222' };
  let sendAttempts = 0;
  await page.route('**/socket.io/**', (route) => route.abort());
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path.endsWith('/auth/login')) return json({ token: 'test-session', user });
    if (path.endsWith('/auth/me'))
      return mode === 'unauthorized'
        ? json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } }, 401)
        : json(user);
    if (path.endsWith('/conversations'))
      return json({
        data:
          mode === 'empty'
            ? []
            : [
                {
                  _id: 'conversation-a',
                  type: 'direct',
                  participant: friend,
                  lastMessage: {},
                  updatedAt: '2026-09-07T10:00:00Z',
                },
                {
                  _id: 'conversation-b',
                  type: 'group',
                  name: 'The Sunday Club',
                  participants: [
                    user,
                    friend,
                    { _id: 'user-c', name: 'Sam', phone: '15550003333' },
                  ],
                  admins: ['user-a'],
                  lastMessage: {},
                  updatedAt: '2026-09-07T10:00:00Z',
                },
              ],
      });
    if (path.endsWith('/messages') && route.request().method() === 'GET')
      return json({ messages: [], hasMore: false });
    if (path.endsWith('/messages')) {
      sendAttempts++;
      return route.abort('connectionfailed');
    }
    if (path.endsWith('/search')) return json([]);
    return json({ error: { message: 'Unknown fixture request' } }, 404);
  });
  await page.goto('/login');
  await page.getByLabel('Your name').fill(user.name);
  await page.getByLabel('Phone number').fill(user.phone);
  await page.getByRole('button', { name: 'Let’s talk' }).click();
  await expect(page).toHaveURL(/\/chat$/);
  return () => sendAttempts;
}

test('an ambiguous send keeps the draft, blocks blind retries, and isolates conversation drafts', async ({
  page,
}) => {
  const attempts = await mockChat(page);
  await page.getByRole('button', { name: /Jamie Chen/ }).click();
  await expect(page.getByText('Every good thread starts')).toBeVisible();
  await page.getByLabel('Write a message').fill('An important thought I should not lose.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByText(/Delivery is unconfirmed/)).toBeVisible();
  await expect(page.getByLabel('Write a message')).toHaveValue(
    'An important thought I should not lose.',
  );
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
  expect(attempts()).toBe(1);
  await page.getByRole('button', { name: 'Check latest messages' }).click();
  expect(attempts()).toBe(1);
  await page.getByRole('button', { name: /unlock draft/ }).click();
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: /The Sunday Club/ }).click();
  await expect(page.getByLabel('Write a message')).toHaveValue('');
  await page.getByRole('button', { name: /Jamie Chen/ }).click();
  await expect(page.getByLabel('Write a message')).toHaveValue(
    'An important thought I should not lose.',
  );
});

test('a new account has an actionable empty state and searchable empty results', async ({
  page,
}) => {
  await mockChat(page, 'empty');
  await expect(page.getByText('Your next hello is here.')).toBeVisible();
  await page.getByRole('button', { name: 'New conversation', exact: true }).click();
  await page.getByLabel('Search people by name or phone').fill('No Such Person');
  await expect(page.getByText('No one found.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'New conversation', exact: true })).toBeFocused();
});

test('expired sessions redirect cleanly instead of exposing stale conversations', async ({
  page,
}) => {
  await mockChat(page, 'unauthorized');
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Your name')).toBeVisible();
  await expect(page.getByRole('button', { name: /Jamie Chen/ })).toHaveCount(0);
});
