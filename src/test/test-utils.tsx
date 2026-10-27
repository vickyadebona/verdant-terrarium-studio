import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { usePathname, useSearchParams } from 'next/navigation';
import { Providers } from '../app/providers';
import { signInMockUser } from './authClientMock';
import { getEdition } from '../catalog/editions';
import type { EditionKey } from '../utils/router';
import {
  AccountView,
  CollectionsView,
  EditionView,
  FaqView,
  NotFoundView,
  OurStoryView,
  StudioView,
  TerraCareView,
} from '../site/views';

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * The whole site as the App Router would render it at the current URL: the shared providers,
 * header and dialogs from app/providers.tsx, plus the view for the path (see src/app/).
 */
export function TestSite({ googleSignInEnabled = false }: { googleSignInEnabled?: boolean }) {
  return (
    <Providers googleSignInEnabled={googleSignInEnabled}>
      <RouteForPath />
    </Providers>
  );
}

function RouteForPath() {
  const pathname = usePathname();
  const mode = useSearchParams().get('mode');
  switch (pathname) {
    case '/collections':
      return <CollectionsView />;
    case '/studio':
      return <StudioView />;
    case '/our-story':
      return <OurStoryView />;
    case '/terracare':
      return <TerraCareView />;
    case '/faq':
      return <FaqView />;
    case '/account':
      return <AccountView initialMode={mode === 'login' ? 'login' : 'signup'} />;
  }
  const edition = pathname.match(/^\/editions\/([^/]+)$/);
  if (edition && getEdition(edition[1])) return <EditionView id={edition[1] as EditionKey} />;
  return <NotFoundView />;
}

export function renderSiteAt(path: string) {
  window.history.replaceState(null, '', path);
  return render(<TestSite />);
}

/** Starts the test signed in, the same way a returning shopper's saved session is restored. */
export function signInAsTestUser() {
  signInMockUser();
}
