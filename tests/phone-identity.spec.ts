import { test, expect } from '@playwright/test';

for (const phone of ['+15550004567', '15550004567']) {
  test(`login and reload preserve the stored identity ${phone}`, async ({ page }) => {
    const user = { _id: `account-${phone}`, name: 'Existing Account', phone };
    let submittedPhone = '';
    await page.route('**/socket.io/**', (route) => route.abort());
    await page.route('**/api/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      let body: unknown = { data: [] };
      if (path.endsWith('/auth/login')) {
        submittedPhone = route.request().postDataJSON().phone;
        body = { token: 'fixture-token', user };
      } else if (path.endsWith('/auth/me')) body = user;
      return route.fulfill({ json: body });
    });
    await page.goto('/login');
    await page.getByLabel('Your name').fill(user.name);
    await page.getByLabel('Phone number').fill(phone.replace('555', ' (555) '));
    await page.getByRole('button', { name: 'Let’s talk' }).click();
    await expect(page).toHaveURL(/\/chat$/);
    expect(submittedPhone).toBe(phone);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Conversations.' })).toBeVisible();
    expect(
      await page.evaluate(() => JSON.parse(sessionStorage.getItem('thread.session')!).user._id),
    ).toBe(user._id);
  });
}
