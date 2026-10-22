import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

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
