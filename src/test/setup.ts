import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

vi.mock('next/navigation', async () => (await import('./nextNavigationMock')).navigationMock);
vi.mock('next/link', async () => ({ default: (await import('./nextNavigationMock')).LinkMock }));
vi.mock('../lib/authClient', async () => ({ authClient: (await import('./authClientMock')).authClient }));

beforeEach(async () => {
  (await import('./authClientMock')).resetMockAuth();
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
