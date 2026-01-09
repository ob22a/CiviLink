import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Runs cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});
