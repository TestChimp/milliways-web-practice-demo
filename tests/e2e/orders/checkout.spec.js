import { test, expect } from '../../fixtures/index.js';
import { Milliways } from '../../pages/milliways.js';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page, newUser }) => {
    const app = new Milliways(page);
    await app.signIn(newUser.email, newUser.password);
    await app.openMenu();
  });

  test('place a standard delivery order to Earth paid by card', {
    tag: '@smoke',
    annotation: [
      { type: 'scenario', description: '#TS-107' },
      { type: 'scenario', description: '#TS-115' },
    ],
  }, async ({ page, markScreenState }) => {
    const app = new Milliways(page);
    await app.addItem('Ameglian Major Cow', { spice: 'Medium' });
    await app.addItem('Water', { quantity: 2 });
    await app.openOrder();
    await markScreenState('Order');

    await app.fillCheckout({ delivery: 'Standard', planet: 'Earth', payment: 'Card' });
    await markScreenState('Order', 'checkout options filled');
    await app.placeOrder();

    await expect(page).toHaveURL(/\/delivery$/);
    await expect(page.getByRole('heading', { name: /Ameglian Major Cow is on its way/ })).toBeVisible();
    await expect(page.getByText('Status: Received')).toBeVisible();
    await expect(page.getByText(/Standard delivery · Total ₭41\.00/)).toBeVisible();
    await markScreenState('Delivery');
  });

  test('express delivery adds the express fee', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-108' }],
  }, async ({ page }) => {
    const app = new Milliways(page);
    await app.addItem('Green Salad');
    await app.openOrder();

    await app.fillCheckout({ delivery: 'Express', planet: 'Earth' });
    await app.placeOrder();

    await expect(page).toHaveURL(/\/delivery$/);
    // ₭22 salad + ₭8 express fee
    await expect(page.getByText(/Express delivery · Total ₭30\.00/)).toBeVisible();
    // Express promises 20 minutes; the countdown should start there.
    await expect(page.getByText(/minutes for delivery/)).toHaveText(/^20(\.0+)? minutes for delivery$/);
  });

  test('DONTPANIC coupon takes 42% off the food subtotal', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-111' }],
  }, async ({ page }) => {
    const app = new Milliways(page);
    await app.addItem('Krikkit Fried Logic');
    await app.openOrder();

    await app.fillCheckout({ delivery: 'Standard', planet: 'Earth', coupon: 'DONTPANIC' });
    await app.placeOrder();

    await expect(page).toHaveURL(/\/delivery$/);
    // ₭40 − 42% = ₭23.20; saved ₭16.80
    await expect(page.getByText(/Total ₭23\.20/)).toBeVisible();
    await expect(page.getByText('(saved ₭16.80)')).toBeVisible();
  });

  test('unknown coupon codes are rejected', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-112' }],
  }, async ({ page, markScreenState }) => {
    const app = new Milliways(page);
    await app.addItem('Coffee');
    await app.openOrder();

    await app.fillCheckout({ coupon: 'FREELUNCH' });
    await app.placeOrder();

    await expect(page.getByRole('alert')).toHaveText('Coupon FREELUNCH is not valid');
    await expect(page).toHaveURL(/\/order$/);
    await markScreenState('Order', 'rejected');
  });
});
