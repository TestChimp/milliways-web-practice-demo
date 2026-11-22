import { expect } from '@playwright/test';

/** Small page helpers shared by the Milliways UI SmartTests. */
export class Milliways {
  constructor(page) {
    this.page = page;
  }

  async signUp(email, password) {
    await this.page.goto('/sign-up');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(this.page.getByRole('button', { name: 'New Order' })).toBeVisible();
  }

  async signIn(email, password) {
    await this.page.goto('/sign-in');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async openMenu() {
    await this.page.getByRole('button', { name: 'New Order' }).click();
    await expect(this.page.getByRole('heading', { name: 'Menu' })).toBeVisible();
  }

  /** Opens an item, optionally sets spice level and quantity, and adds it to the order. */
  async addItem(name, { quantity = 1, spice } = {}) {
    await this.page.getByRole('button', { name: new RegExp(name) }).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name })).toBeVisible();
    if (spice) await dialog.getByLabel('Spice level').selectOption({ label: spice });
    for (let i = 1; i < quantity; i++) await dialog.getByRole('button', { name: 'Increase quantity' }).click();
    await dialog.getByRole('button', { name: 'Add to Order' }).click();
    await expect(dialog).toBeHidden();
  }

  async openOrder() {
    await this.page.getByRole('button', { name: /View Order/ }).click();
    await expect(this.page.getByRole('heading', { name: 'Your Order' })).toBeVisible();
  }

  async fillCheckout({ delivery = 'Standard', planet = 'Earth', address = '42 Slartibartfast Way', payment = 'Card', coupon } = {}) {
    await this.page.getByRole('radio', { name: new RegExp(`^${delivery}`) }).check();
    await this.page.getByLabel('Planet').selectOption({ label: planet });
    if (address !== undefined) await this.page.getByLabel('Delivery address').fill(address);
    await this.page.getByLabel('Payment method').selectOption({ label: payment });
    if (coupon) await this.page.getByLabel('Coupon code').fill(coupon);
  }

  async placeOrder() {
    await this.page.getByRole('button', { name: 'Place Order' }).click();
  }
}
