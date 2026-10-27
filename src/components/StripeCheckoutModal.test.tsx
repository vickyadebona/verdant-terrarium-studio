import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { AllProviders } from '../test/test-utils';
import { useCart } from '../context/CartContext';
import { ACCESSORY_PRODUCTS } from '../catalog';

function CheckoutTestHost() {
  const { addStandardItem, openCheckoutModal } = useCart();
  return (
    <div>
      <button
        onClick={() => {
          const { sku, name } = ACCESSORY_PRODUCTS.copperMicroLeds;
          addStandardItem({ type: 'hardware', sku, name });
          openCheckoutModal();
        }}
      >
        Start Checkout
      </button>
      <StripeCheckoutModal />
    </div>
  );
}

function renderCheckout() {
  render(
    <AllProviders>
      <CheckoutTestHost />
    </AllProviders>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start Checkout' }));
}

describe('StripeCheckoutModal', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('opens with empty contact, address and card fields', () => {
    renderCheckout();

    for (const label of [
      'Full Name',
      'Email Address (Order Tracking)',
      'Phone Number',
      'Street Address',
      'City',
      'State',
      'ZIP Code',
      'Card Number',
      'Expires (MM/YY)',
      'CVC',
    ]) {
      expect(screen.getByLabelText(label)).toHaveValue('');
    }
  });

  it('asks for the missing details instead of charging', () => {
    renderCheckout();

    fireEvent.click(screen.getByRole('button', { name: /Authorize & Pay/ }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please add your full name, email address, street address, city, state, ZIP code, card number, card expiry (MM/YY), CVC.'
    );
    expect(screen.getByRole('dialog', { name: /Stripe Embedded Checkout/ })).toBeInTheDocument();
  });

  it('shows the test card shortcut only in development builds', () => {
    renderCheckout();
    expect(screen.getByRole('button', { name: /Auto-fill Stripe 4242 Test Card/ })).toBeInTheDocument();
  });

  it('hides the test card shortcut outside development builds', () => {
    vi.stubEnv('NODE_ENV', 'production');
    renderCheckout();
    expect(screen.queryByRole('button', { name: /Auto-fill Stripe 4242 Test Card/ })).not.toBeInTheDocument();
  });
});
