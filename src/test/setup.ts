import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    configurable: true,
    writable: true,
  });
});
