import { test, expect } from '@playwright/test';

test('environment is healthy', async ({ request }) => {
  const api = process.env.API_BASE_URL ?? 'http://localhost:3001';
  const health = await request.get(`${api}/health`);
  expect(health.ok()).toBeTruthy();
});
