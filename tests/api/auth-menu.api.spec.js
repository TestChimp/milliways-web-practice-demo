import { test, expect } from '../fixtures/index.js';

const api = () => process.env.API_BASE_URL ?? 'http://localhost:3001';

test.describe('Auth and menu API', () => {
  test('sign-up returns a session and sign-in accepts the same credentials', {
    tag: '@smoke',
    annotation: [
      { type: 'scenario', description: '#TS-100' },
      { type: 'scenario', description: '#TS-101' },
    ],
  }, async ({ request }) => {
    const email = `api-auth-${Date.now()}@milliways.test`;
    const signUp = await request.post(`${api()}/auth/signup`, { data: { email, password: 'DontPanic42!' } });
    expect(signUp.status()).toBe(201);
    const session = await signUp.json();
    expect(session.user.email).toBe(email);
    expect(session.token).toMatch(/^demo-user-\d+$/);

    const signIn = await request.post(`${api()}/auth/signin`, { data: { email, password: 'DontPanic42!' } });
    expect(signIn.status()).toBe(200);
    expect((await signIn.json()).user.id).toBe(session.user.id);
  });

  test('sign-in with a wrong password returns 401', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-102' }],
  }, async ({ request, newUser }) => {
    const res = await request.post(`${api()}/auth/signin`, { data: { email: newUser.email, password: 'nope' } });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid email or password' });
  });

  test('menu lists both sections with prices in cents', {
    tag: '@regression',
    annotation: [{ type: 'scenario', description: '#TS-104' }],
  }, async ({ request }) => {
    const res = await request.get(`${api()}/menu`);
    expect(res.status()).toBe(200);
    const { sections } = await res.json();
    expect(sections.map((s) => s.title)).toEqual(['MAIN DISHES', 'DRINKS']);
    expect(sections[0].items[0]).toMatchObject({ name: 'Ameglian Major Cow', priceCents: 3500 });
  });
});
