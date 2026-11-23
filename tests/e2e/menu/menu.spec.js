import { test, expect } from '../../fixtures/index.js';
import { Milliways } from '../../pages/milliways.js';

test.describe('Menu', () => {
  test.beforeEach(async ({ page, newUser }) => {
    const app = new Milliways(page);
    await app.signIn(newUser.email, newUser.password);
    await app.openMenu();
  });

  test('menu shows main dishes and drinks with prices', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-104' }],
  }, async ({ page, markScreenState }) => {
    await expect(page.getByRole('heading', { name: 'MAIN DISHES' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'DRINKS' })).toBeVisible();
    await markScreenState('Menu');

    const steak = page.getByRole('button', { name: /Ameglian Major Cow/ });
    await expect(steak).toContainText('₭35.00');
    await expect(steak).toContainText('The finest cut from a cow that wants to be eaten');
    await expect(page.locator('.menu-card')).toHaveCount(10);
  });

  test('add a menu item with a chosen quantity to the order', {
    tag: '@smoke',
    annotation: [{ type: 'scenario', description: '#TS-105' }],
  }, async ({ page, markScreenState }) => {
    const app = new Milliways(page);

    await page.getByRole('button', { name: /Green Salad/ }).click();
    await markScreenState('Menu', 'item dialog');
    await page.getByRole('dialog').getByRole('button', { name: 'Increase quantity' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Increase quantity' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Add to Order' }).click();

    const bar = page.getByRole('button', { name: /View Order/ });
    await expect(bar).toContainText('3 items');
    await expect(bar).toContainText('₭66.00');
    await markScreenState('Menu', 'order in progress');

    await app.openOrder();
    const line = page.locator('.line-list li').filter({ hasText: 'Green Salad' });
    await expect(line).toContainText('3 × ₭22.00');
    await expect(line).toContainText('₭66.00');
  });

  test('choose a spice level for a main dish', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-106' }],
  }, async ({ page }) => {
    const app = new Milliways(page);

    await app.addItem('Soup of the Day', { spice: 'Hot' });
    await app.addItem('Ameglian Major Cow', { spice: 'Mild' });

    // Drinks have no spice option.
    await page.getByRole('button', { name: /Coffee/ }).click();
    await expect(page.getByRole('dialog').getByLabel('Spice level')).toHaveCount(0);
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

    await app.openOrder();
    const lines = page.locator('.line-list li');
    await expect(lines.filter({ hasText: 'Soup of the Day' })).toContainText('Hot');
    await expect(lines.filter({ hasText: 'Ameglian Major Cow' })).toContainText('Mild');
  });
});
