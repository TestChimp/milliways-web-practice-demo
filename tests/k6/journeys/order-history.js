import http from 'k6/http';
import { check } from 'k6';
import { profileOptions } from '../profiles/index.js';
import { handleSummary } from '../lib/handleSummary.js';
import { thinkTime } from '../lib/think-time.js';

export const options = profileOptions;
export { handleSummary };

export const testchimp = {
  id: 'order-history',
  kind: 'journey',
  scenarios: ['#TS-101', '#TS-117'],
  testTypes: ['load'],
  operations: [],
  paths: ['/auth/signin', '/orders'],
};

const BASE = __ENV.API_BASE_URL || 'http://localhost:3001';
const json = { headers: { 'Content-Type': 'application/json' } };

// Returning guests with a few past orders each, created once before the run.
export function setup() {
  const guests = [];
  for (let g = 0; g < 10; g++) {
    const email = `perf-history-${g}-${Date.now()}@milliways.test`;
    const res = http.post(`${BASE}/auth/signup`, JSON.stringify({ email, password: 'Perf42!' }), json);
    const auth = { headers: { ...json.headers, Authorization: `Bearer ${res.json('token')}` } };
    for (let o = 0; o < 3 + (g % 5); o++) {
      http.post(`${BASE}/orders`, JSON.stringify({
        items: [{ menuItemId: 6 + (o % 5), quantity: 1 }],
        delivery: { method: 'STANDARD', planet: 'EARTH', address: '1 Lamuella' },
      }), auth);
    }
    guests.push(email);
  }
  return { guests };
}

export default function (data) {
  const email = data.guests[(__VU + __ITER) % data.guests.length];
  const signIn = http.post(`${BASE}/auth/signin`, JSON.stringify({ email, password: 'Perf42!' }), json);
  check(signIn, { 'sign-in 200': (r) => r.status === 200 });
  thinkTime();

  const orders = http.get(`${BASE}/orders`, { headers: { Authorization: `Bearer ${signIn.json('token')}` } });
  check(orders, { 'orders 200': (r) => r.status === 200, 'has orders': (r) => r.json('orders').length >= 3 });
  thinkTime();
}
