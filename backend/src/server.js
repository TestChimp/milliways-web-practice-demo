import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { query, waitForDatabase, withTransaction } from './db.js';
import { initializeDatabase } from './schema.js';
import { CheckoutError, SPICE_LEVELS, normalizeCheckout, priceOrder, validateCheckout } from './checkout.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

function tokenForUser(userId) {
  return `demo-user-${userId}`;
}

function userIdFromToken(token) {
  const match = /^demo-user-(\d+)$/.exec(token ?? '');
  return match ? Number(match[1]) : null;
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
  };
}

function orderDto(row) {
  return {
    id: row.id,
    status: row.status,
    totalCents: row.total_cents,
    breakdown: {
      subtotalCents: row.subtotal_cents,
      deliveryFeeCents: row.delivery_fee_cents,
      discountCents: row.discount_cents,
      tipCents: row.tip_cents,
    },
    delivery: {
      method: row.delivery_method,
      planet: row.planet,
      address: row.delivery_address,
      estimatedMinutes: row.estimated_minutes,
    },
    payment: { method: row.payment_method, tipPercent: row.tip_percent },
    couponCode: row.coupon_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

async function requireUser(req, res, next) {
  try {
    const header = req.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    const userId = userIdFromToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Missing or invalid demo token' });
    }

    const result = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/auth/signup', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, password],
    );
    const user = publicUser(result.rows[0]);

    return res.status(201).json({ user, token: tokenForUser(user.id) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return next(error);
  }
});

app.post('/auth/signin', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    const result = await query(
      'SELECT id, email FROM users WHERE email = $1 AND password = $2',
      [email, password],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = publicUser(result.rows[0]);
    return res.json({ user, token: tokenForUser(user.id) });
  } catch (error) {
    return next(error);
  }
});

app.get('/menu', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT id, section, name, description, price_cents, color, image_name
      FROM menu_items
      ORDER BY sort_order ASC, id ASC
    `);

    const sections = [];
    const sectionsByTitle = new Map();

    for (const row of result.rows) {
      if (!sectionsByTitle.has(row.section)) {
        const section = { title: row.section, items: [] };
        sectionsByTitle.set(row.section, section);
        sections.push(section);
      }

      sectionsByTitle.get(row.section).items.push({
        id: row.id,
        name: row.name,
        description: row.description,
        priceCents: row.price_cents,
        color: row.color,
        imageName: row.image_name,
      });
    }

    return res.json({ sections });
  } catch (error) {
    return next(error);
  }
});

app.post('/orders', requireUser, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }

    const checkout = normalizeCheckout(body);
    validateCheckout(checkout);

    const order = await withTransaction(async (client) => {
      const orderItems = [];

      for (const item of items) {
        const menuItemId = Number(item.menuItemId);
        const quantity = Number(item.quantity);
        const spiceLevel = item.spiceLevel ?? null;

        if (!Number.isInteger(menuItemId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
          throw new CheckoutError(400, 'Invalid order item');
        }
        if (spiceLevel !== null && !SPICE_LEVELS.includes(spiceLevel)) {
          throw new CheckoutError(400, `Unknown spice level ${spiceLevel}`);
        }

        const menuResult = await client.query(
          'SELECT id, name, section, price_cents FROM menu_items WHERE id = $1',
          [menuItemId],
        );

        if (menuResult.rowCount === 0) {
          throw new CheckoutError(400, `Menu item ${menuItemId} was not found`);
        }

        const menuItem = menuResult.rows[0];
        if (spiceLevel !== null && menuItem.section === 'DRINKS') {
          throw new CheckoutError(422, `Spice level cannot be set on drinks (${menuItem.name})`);
        }
        orderItems.push({ menuItem, quantity, spiceLevel });
      }

      const price = priceOrder(
        orderItems.map((l) => ({ priceCents: l.menuItem.price_cents, quantity: l.quantity, spiceLevel: l.spiceLevel })),
        checkout,
      );

      const orderResult = await client.query(
        `INSERT INTO orders (
           user_id, status, total_cents, delivery_method, planet, delivery_address, delivery_instructions,
           payment_method, tip_percent, coupon_code, subtotal_cents, delivery_fee_cents, discount_cents,
           tip_cents, estimated_minutes
         ) VALUES ($1, 'received', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          req.user.id,
          price.totalCents,
          checkout.delivery.method,
          checkout.delivery.planet,
          checkout.delivery.address,
          checkout.delivery.instructions,
          checkout.payment.method,
          Number(checkout.payment.tipPercent),
          checkout.couponCode,
          price.subtotalCents,
          price.deliveryFeeCents,
          price.discountCents,
          price.tipCents,
          price.estimatedMinutes,
        ],
      );
      const createdOrder = orderResult.rows[0];

      for (const item of orderItems) {
        await client.query(
          'INSERT INTO order_items (order_id, menu_item_id, name, price_cents, quantity, spice_level) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            createdOrder.id,
            item.menuItem.id,
            item.menuItem.name,
            item.menuItem.price_cents,
            item.quantity,
            item.spiceLevel,
          ],
        );
      }

      return createdOrder;
    });

    return res.status(201).json({ order: orderDto(order) });
  } catch (error) {
    return next(error);
  }
});

app.get('/orders', requireUser, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );

    return res.json({ orders: result.rows.map(orderDto) });
  } catch (error) {
    return next(error);
  }
});

app.get('/orders/:id/status', requireUser, async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const result = await query(
      'SELECT id, status, updated_at, delivery_method, estimated_minutes FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];
    return res.json({
      order: {
        id: order.id,
        status: order.status,
        deliveryMethod: order.delivery_method,
        estimatedMinutes: order.estimated_minutes,
        updatedAt: order.updated_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
});

await waitForDatabase();
await initializeDatabase();

app.listen(port, '0.0.0.0', () => {
  console.log(`Milliways demo API listening on port ${port}`);
});
