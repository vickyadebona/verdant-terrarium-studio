import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

vi.mock('next/navigation', async () => (await import('./nextNavigationMock')).navigationMock);
vi.mock('next/link', async () => ({ default: (await import('./nextNavigationMock')).LinkMock }));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    configurable: true,
    writable: true,
  });
});
