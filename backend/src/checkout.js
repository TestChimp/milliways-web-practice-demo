// Checkout pricing and validation rules for POST /orders.
// Kept separate from server.js so the business rules are easy to read and test.

export const DELIVERY_METHODS = ['STANDARD', 'EXPRESS', 'TELEPORT', 'PICKUP'];
export const PLANETS = ['EARTH', 'MAGRATHEA', 'BETELGEUSE_V', 'SANTRAGINUS_V', 'KRIKKIT'];
export const PAYMENT_METHODS = ['CARD', 'BABEL_FISH_CREDITS', 'GALACTIC_EXPRESS', 'CASH_ON_DELIVERY'];
export const SPICE_LEVELS = ['MILD', 'MEDIUM', 'HOT', 'SUPERNOVA'];
export const TIP_PERCENTS = [0, 10, 15, 20];

const DELIVERY_FEES_CENTS = { STANDARD: 0, EXPRESS: 800, TELEPORT: 1500, PICKUP: 0 };
const DELIVERY_MINUTES = { STANDARD: 45, EXPRESS: 20, TELEPORT: 1, PICKUP: 15 };
// Planets further from the restaurant add a distance surcharge (not for teleport or pickup).
const PLANET_SURCHARGE_CENTS = { EARTH: 0, MAGRATHEA: 300, BETELGEUSE_V: 600, SANTRAGINUS_V: 450, KRIKKIT: 900 };
const SUPERNOVA_SURCHARGE_CENTS = 150;
const BABEL_FISH_DISCOUNT_PERCENT = 5;

export const COUPONS = {
  DONTPANIC: { percentOff: 42, minSubtotalCents: 2000 },
  TOWELDAY: { percentOff: 25, minSubtotalCents: 0, deliveryOnly: ['PICKUP'] },
};

export class CheckoutError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Fills defaults for legacy clients that send only `items`. */
export function normalizeCheckout(body) {
  const delivery = body.delivery ?? {};
  const payment = body.payment ?? {};
  return {
    delivery: {
      method: delivery.method ?? 'STANDARD',
      planet: delivery.planet ?? 'EARTH',
      address: delivery.address ?? null,
      instructions: delivery.instructions ?? null,
    },
    payment: {
      method: payment.method ?? 'CARD',
      tipPercent: payment.tipPercent ?? 0,
    },
    couponCode: body.couponCode ? String(body.couponCode).trim().toUpperCase() : null,
  };
}

export function validateCheckout({ delivery, payment, couponCode }) {
  if (!DELIVERY_METHODS.includes(delivery.method)) {
    throw new CheckoutError(400, `Unknown delivery method ${delivery.method}`);
  }
  if (!PLANETS.includes(delivery.planet)) {
    throw new CheckoutError(400, `Unknown planet ${delivery.planet}`);
  }
  if (!PAYMENT_METHODS.includes(payment.method)) {
    throw new CheckoutError(400, `Unknown payment method ${payment.method}`);
  }
  if (!TIP_PERCENTS.includes(Number(payment.tipPercent))) {
    throw new CheckoutError(400, 'Tip must be 0, 10, 15 or 20 percent');
  }
  if (delivery.method !== 'PICKUP' && !String(delivery.address ?? '').trim()) {
    throw new CheckoutError(400, 'Delivery address is required unless you pick up');
  }
  if (delivery.method === 'TELEPORT' && delivery.planet === 'KRIKKIT') {
    throw new CheckoutError(422, 'Teleport delivery is not available to Krikkit');
  }
  if (delivery.method === 'TELEPORT' && payment.method === 'CASH_ON_DELIVERY') {
    throw new CheckoutError(422, 'Cash on delivery cannot be used with teleport delivery');
  }
  if (delivery.method === 'PICKUP' && delivery.planet !== 'EARTH') {
    throw new CheckoutError(422, 'Pickup is only available at the Earth restaurant');
  }
  if (couponCode && !COUPONS[couponCode]) {
    throw new CheckoutError(400, `Coupon ${couponCode} is not valid`);
  }
}

/**
 * lineItems: [{ priceCents, quantity, spiceLevel, section }]
 * Returns the price breakdown in cents.
 */
export function priceOrder(lineItems, { delivery, payment, couponCode }) {
  let subtotalCents = 0;
  for (const line of lineItems) {
    const surcharge = line.spiceLevel === 'SUPERNOVA' ? SUPERNOVA_SURCHARGE_CENTS : 0;
    subtotalCents += (line.priceCents + surcharge) * line.quantity;
  }

  let deliveryFeeCents = DELIVERY_FEES_CENTS[delivery.method];
  if (delivery.method === 'STANDARD' || delivery.method === 'EXPRESS') {
    deliveryFeeCents += PLANET_SURCHARGE_CENTS[delivery.planet];
  }

  let discountCents = 0;
  if (couponCode) {
    const coupon = COUPONS[couponCode];
    if (coupon.deliveryOnly && !coupon.deliveryOnly.includes(delivery.method)) {
      throw new CheckoutError(422, `Coupon ${couponCode} is only valid for ${coupon.deliveryOnly.join(', ')}`);
    }
    if (subtotalCents < coupon.minSubtotalCents) {
      throw new CheckoutError(422, `Coupon ${couponCode} needs a subtotal of at least ₭${coupon.minSubtotalCents / 100}`);
    }
    // Coupons apply to food only.
    const discountBase = delivery.method === 'TELEPORT' ? subtotalCents + deliveryFeeCents : subtotalCents;
    discountCents = Math.round((discountBase * coupon.percentOff) / 100);
  }

  if (payment.method === 'BABEL_FISH_CREDITS') {
    discountCents += Math.round(((subtotalCents - discountCents) * BABEL_FISH_DISCOUNT_PERCENT) / 100);
  }

  const tipCents = Math.round((subtotalCents * Number(payment.tipPercent)) / 100);
  const totalCents = Math.max(0, subtotalCents + deliveryFeeCents - discountCents + tipCents);

  return {
    subtotalCents,
    deliveryFeeCents,
    discountCents,
    tipCents,
    totalCents,
    estimatedMinutes: DELIVERY_MINUTES[delivery.method],
  };
}
