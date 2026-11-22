import { test, expect } from '../../fixtures/index.js';
import { Milliways } from '../../pages/milliways.js';

test.describe('Account', () => {
  test('new guest signs up and lands on the welcome screen', {
    tag: '@smoke',
    annotation: [{ type: 'scenario', description: '#TS-100' }],
  }, async ({ page, markScreenState }) => {
    const app = new Milliways(page);
    const email = `signup-${Date.now()}@milliways.test`;

    await page.goto('/');
    await expect(page).toHaveURL(/\/sign-in$/);
    await markScreenState('Sign in');
    await page.getByRole('link', { name: 'Create an account' }).click();
    await markScreenState('Sign up');

    await app.signUp(email, 'DontPanic42!');
    await expect(page).toHaveURL(/\/welcome$/);
    await markScreenState('Welcome');

    // Session survives navigation.
    await app.openMenu();
    await expect(page).toHaveURL(/\/menu$/);
  });

  test('returning user signs in with valid credentials', {
    tag: '@smoke',
    annotation: [{ type: 'scenario', description: '#TS-101' }],
  }, async ({ page, newUser }) => {
    const app = new Milliways(page);

    await app.signIn(newUser.email, newUser.password);

    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole('button', { name: 'New Order' })).toBeVisible();
  });

  test('sign-in with a wrong password shows an error', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-102' }],
  }, async ({ page, newUser, markScreenState }) => {
    const app = new Milliways(page);

    await app.signIn(newUser.email, 'not-the-password');

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/sign-in$/);
    await markScreenState('Sign in', 'error');
  });
});
