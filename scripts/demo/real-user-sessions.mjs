// Simulated real-user traffic for the TrueCoverage demo.
// Drives the web app like a guest would (no SmartTest identity), tagging RUM as environment "production".
// Usage: node scripts/demo/real-user-sessions.mjs [sessions=40] [baseUrl=http://localhost:4300]
// Playwright is resolved from tests/node_modules.
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../tests/package.json', import.meta.url))('playwright');

const SESSIONS = Number(process.argv[2] ?? 40);
const BASE = process.argv[3] ?? 'http://localhost:4300';

// Real users lean on checkout options the SmartTests barely touch (teleport, pickup, Babel Fish credits, far planets).
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
  return pairs[pairs.length - 1][0];
};
const DELIVERY = [['Standard', 30], ['Express', 15], ['Teleport', 35], ['Pick up', 20]];
const PLANET = [['Earth', 35], ['Magrathea', 25], ['Betelgeuse V', 20], ['Santraginus V', 10], ['Krikkit', 10]];
const PAYMENT = [['Card', 35], ['Babel Fish credits (5% off)', 35], ['Galactic Express', 20], ['Cash on delivery', 10]];
const SPICE = [['Mild', 20], ['Medium', 20], ['Hot', 25], ['Supernova', 35]];
const COUPON = [['', 55], ['DONTPANIC', 30], ['TOWELDAY', 8], ['FREELUNCH', 7]];
const TIP = [['0', 40], ['10', 25], ['15', 20], ['20', 15]];
const ADDRESSES = ['42 Slartibartfast Way', '7 Heart of Gold Dock', '1 Vogon Constructor Fleet Rd', 'Flat 3, Lamuella'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function flushRum(page) {
  await page.evaluate(async () => {
    const f = globalThis.__TC_RUM_FLUSH;
    if (typeof f === 'function') await f();
  }).catch(() => {});
}

async function placeOrder(page) {
  const deliveryLabel = weighted(DELIVERY);
  await page.getByRole('radio', { name: new RegExp(`^${deliveryLabel}`) }).check();
  const planet = deliveryLabel === 'Pick up' && Math.random() < 0.8 ? 'Earth' : weighted(PLANET);
  await page.getByLabel('Planet').selectOption({ label: planet });
  if (deliveryLabel !== 'Pick up') {
    if (Math.random() < 0.9) await page.getByLabel('Delivery address').fill(pick(ADDRESSES));
    if (Math.random() < 0.3) await page.getByLabel('Delivery instructions').fill('Beware of the Bugblatter Beast');
  }
  await page.getByLabel('Payment method').selectOption({ label: weighted(PAYMENT) });
  await page.getByLabel('Tip').selectOption(weighted(TIP));
  const coupon = weighted(COUPON);
  if (coupon) await page.getByLabel('Coupon code').fill(coupon);
  await page.getByRole('button', { name: 'Place Order' }).click();
  return Promise.race([
    page.waitForURL('**/delivery', { timeout: 8000 }).then(() => 'placed'),
    page.getByRole('alert').waitFor({ timeout: 8000 }).then(() => 'rejected'),
  ]).catch(() => 'unknown');
}

async function session(browser, i) {
  const context = await browser.newContext({ viewport: pick([{ width: 1280, height: 800 }, { width: 390, height: 844 }]) });
  await context.addInitScript(() => { globalThis.__MILLIWAYS_RUM_ENV = 'production'; });
  const page = await context.newPage();
  const email = `guest-${Date.now()}-${i}@milliways.galaxy`;
  try {
    await page.goto(`${BASE}/sign-up`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('Towel42!');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL('**/welcome');

    const orders = Math.random() < 0.3 ? 2 : 1;
    for (let o = 0; o < orders; o++) {
      await page.getByRole('button', { name: 'New Order' }).click();
      await page.waitForURL('**/menu');
      const lines = 1 + Math.floor(Math.random() * 3);
      for (let l = 0; l < lines; l++) {
        const cards = page.locator('.menu-card');
        await cards.first().waitFor();
        const count = await cards.count();
        await cards.nth(Math.floor(Math.random() * count)).click();
        const spice = page.getByLabel('Spice level');
        if (await spice.isVisible().catch(() => false)) {
          await spice.selectOption({ label: weighted(SPICE) });
        }
        const extra = Math.floor(Math.random() * 3);
        for (let q = 0; q < extra; q++) await page.getByRole('button', { name: 'Increase quantity' }).click();
        await page.getByRole('button', { name: 'Add to Order' }).click();
        await sleep(200 + Math.random() * 600);
      }
      await page.getByRole('button', { name: /View Order/ }).click();
      await page.waitForURL('**/order');
      let outcome = await placeOrder(page);
      if (outcome === 'rejected' && Math.random() < 0.7) {
        // Guest fixes the problem the simple way: standard delivery to Earth, card, no coupon.
        await page.getByRole('radio', { name: /^Standard/ }).check();
        await page.getByLabel('Planet').selectOption({ label: 'Earth' });
        await page.getByLabel('Delivery address').fill(pick(ADDRESSES));
        await page.getByLabel('Payment method').selectOption({ label: 'Card' });
        await page.getByLabel('Coupon code').fill('');
        await page.getByRole('button', { name: 'Place Order' }).click();
        outcome = await page.waitForURL('**/delivery', { timeout: 8000 }).then(() => 'placed').catch(() => 'rejected');
      }
      if (outcome !== 'placed') break;
      await sleep(2500 + Math.random() * 3000);
      await page.getByRole('button', { name: 'Close' }).click();
      await page.waitForURL('**/welcome');
    }
    // Many guests check their order history afterwards (no SmartTest covers this yet).
    if (Math.random() < 0.6) {
      await page.getByRole('button', { name: 'Account' }).click();
      await page.getByText('Past Orders').waitFor();
      await sleep(1500);
    }
    await flushRum(page);
    process.stdout.write('.');
  } catch (e) {
    await flushRum(page);
    process.stdout.write('x');
    if (process.env.DEBUG) console.error(`\nsession ${i}: ${e.message}`);
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch();
const PARALLEL = 4;
for (let i = 0; i < SESSIONS; i += PARALLEL) {
  await Promise.all(Array.from({ length: Math.min(PARALLEL, SESSIONS - i) }, (_, k) => session(browser, i + k)));
}
await browser.close();
console.log(`\n${SESSIONS} sessions done`);
