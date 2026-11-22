import http from 'k6/http';
import { check } from 'k6';
import { profileOptions } from '../profiles/index.js';
import { handleSummary } from '../lib/handleSummary.js';
import { thinkTime } from '../lib/think-time.js';

export const options = profileOptions;
export { handleSummary };

export const testchimp = {
  id: 'place-order',
  kind: 'journey',
  scenarios: ['#TS-105', '#TS-107', '#TS-108', '#TS-115'],
  testTypes: ['load'],
  operations: [],
  paths: ['/auth/signup', '/menu', '/orders', '/orders/{id}/status'],
};

const BASE = __ENV.API_BASE_URL || 'http://localhost:3001';
const json = { headers: { 'Content-Type': 'application/json' } };
let token; // one guest per VU, created on its first iteration

function signUp() {
  const email = `perf-${__VU}-${Date.now()}@milliways.test`;
  const res = http.post(`${BASE}/auth/signup`, JSON.stringify({ email, password: 'Perf42!' }), json);
  check(res, { 'sign-up 201': (r) => r.status === 201 });
  return res.json('token');
}

export default function () {
  if (!token) token = signUp();
  const auth = { headers: { ...json.headers, Authorization: `Bearer ${token}` } };

  const menu = http.get(`${BASE}/menu`);
  check(menu, { 'menu 200': (r) => r.status === 200 });
  thinkTime();

  const express = Math.random() < 0.3;
  const order = http.post(
    `${BASE}/orders`,
    JSON.stringify({
      items: [{ menuItemId: 1 + Math.floor(Math.random() * 5), quantity: 1 + Math.floor(Math.random() * 3) }],
      delivery: { method: express ? 'EXPRESS' : 'STANDARD', planet: 'EARTH', address: '42 Slartibartfast Way' },
      payment: { method: 'CARD', tipPercent: 10 },
    }),
    auth,
  );
  check(order, { 'order 201': (r) => r.status === 201 });
  thinkTime();

  const id = order.json('order.id');
  const status = http.get(`${BASE}/orders/${id}/status`, auth);
  check(status, { 'status 200': (r) => r.status === 200 });
  thinkTime();
}
