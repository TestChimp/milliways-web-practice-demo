import { test as base } from '@playwright/test';

const apiBase = () => process.env.API_BASE_URL ?? 'http://localhost:3001';

/** Creates a fresh demo user through the public sign-up API. */
export async function createUser(request, prefix = 'smarttest') {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@milliways.test`;
  const password = 'DontPanic42!';
  const res = await request.post(`${apiBase()}/auth/signup`, { data: { email, password } });
  if (res.status() !== 201) {
    throw new Error(`Sign-up failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return { email, password, token: body.token, id: body.user.id };
}

export const test = base.extend({
  /** A brand-new user (not signed in). */
  newUser: async ({ request }, use) => {
    await use(await createUser(request));
  },
  /** Authorization headers for a fresh user, for API tests. */
  authedApi: async ({ request }, use) => {
    const user = await createUser(request, 'api');
    await use({ user, headers: { Authorization: `Bearer ${user.token}` }, base: apiBase() });
  },
});
