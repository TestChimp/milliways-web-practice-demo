import { test, expect } from '../fixtures/index.js';

const order = (overrides = {}) => ({
  items: [{ menuItemId: 2, quantity: 1 }], // Green Salad, ₭22
  delivery: { method: 'STANDARD', planet: 'EARTH', address: '42 Slartibartfast Way' },
  payment: { method: 'CARD', tipPercent: 0 },
  ...overrides,
});

test.describe('Orders API', () => {
  test('standard delivery to Earth is priced at the food subtotal', {
    tag: '@smoke',
    annotation: [{ type: 'scenario', description: '#TS-107' }],
  }, async ({ request, authedApi }) => {
    const res = await request.post(`${authedApi.base}/orders`, { headers: authedApi.headers, data: order() });

    expect(res.status()).toBe(201);
    const { order: placed } = await res.json();
    expect(placed.status).toBe('received');
    expect(placed.breakdown).toEqual({ subtotalCents: 2200, deliveryFeeCents: 0, discountCents: 0, tipCents: 0 });
    expect(placed.totalCents).toBe(2200);
    expect(placed.delivery).toMatchObject({ method: 'STANDARD', planet: 'EARTH', estimatedMinutes: 45 });
  });

  test('express delivery to Magrathea adds the express fee and planet surcharge', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-108' }],
  }, async ({ request, authedApi }) => {
    const res = await request.post(`${authedApi.base}/orders`, {
      headers: authedApi.headers,
      data: order({
        items: [{ menuItemId: 1, quantity: 2, spiceLevel: 'MILD' }], // 2 × ₭35
        delivery: { method: 'EXPRESS', planet: 'MAGRATHEA', address: '1 Factory Floor' },
        payment: { method: 'CARD', tipPercent: 10 },
      }),
    });

    expect(res.status()).toBe(201);
    const { order: placed } = await res.json();
    // ₭70 food + ₭8 express + ₭3 Magrathea + ₭7 tip
    expect(placed.breakdown).toEqual({ subtotalCents: 7000, deliveryFeeCents: 1100, discountCents: 0, tipCents: 700 });
    expect(placed.totalCents).toBe(8800);
    expect(placed.delivery.estimatedMinutes).toBe(20);
  });

  test('DONTPANIC coupon discounts food only', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-111' }],
  }, async ({ request, authedApi }) => {
    const res = await request.post(`${authedApi.base}/orders`, {
      headers: authedApi.headers,
      data: order({ items: [{ menuItemId: 5, quantity: 1 }], couponCode: 'DONTPANIC' }), // Krikkit Fried Logic ₭40
    });

    expect(res.status()).toBe(201);
    const { order: placed } = await res.json();
    expect(placed.breakdown.discountCents).toBe(1680);
    expect(placed.totalCents).toBe(2320);
    expect(placed.couponCode).toBe('DONTPANIC');
  });

  test('unknown coupon is rejected with 400', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-112' }],
  }, async ({ request, authedApi }) => {
    const res = await request.post(`${authedApi.base}/orders`, {
      headers: authedApi.headers,
      data: order({ couponCode: 'FREELUNCH' }),
    });

    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: 'Coupon FREELUNCH is not valid' });
  });

  test('delivery order without an address is rejected with 400', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-114' }],
  }, async ({ request, authedApi }) => {
    const res = await request.post(`${authedApi.base}/orders`, {
      headers: authedApi.headers,
      data: order({ delivery: { method: 'STANDARD', planet: 'EARTH' } }),
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('Delivery address is required unless you pick up');
  });

  test('placed orders appear in the list and report their status', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-115' }],
  }, async ({ request, authedApi }) => {
    const created = await request.post(`${authedApi.base}/orders`, { headers: authedApi.headers, data: order() });
    const { order: placed } = await created.json();

    const list = await request.get(`${authedApi.base}/orders`, { headers: authedApi.headers });
    expect(list.status()).toBe(200);
    expect((await list.json()).orders.map((o) => o.id)).toEqual([placed.id]);

    const status = await request.get(`${authedApi.base}/orders/${placed.id}/status`, { headers: authedApi.headers });
    expect(status.status()).toBe(200);
    expect((await status.json()).order).toMatchObject({ id: placed.id, status: 'received', deliveryMethod: 'STANDARD' });
  });
});
