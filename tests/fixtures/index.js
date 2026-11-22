import { mergeTests } from '@playwright/test';
import { installTestChimp } from '@testchimp/playwright/runtime';
import { test as user } from './user.fixture.js';

export const test = installTestChimp(mergeTests(user));
export { expect } from '@playwright/test';
