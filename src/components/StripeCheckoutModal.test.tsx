import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { AllProviders } from '../test/test-utils';
import { useCart } from '../context/CartContext';
import { ACCESSORY_PRODUCTS } from '../catalog';
import { signInMockUser } from '../test/authClientMock';

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

  it('asks for no address on studio pickup, and keeps it off the order', async () => {
    renderCheckout();
    fireEvent.change(screen.getByLabelText('Street Address'), { target: { value: '1 Typed Before Switching' } });

    fireEvent.click(screen.getByRole('radio', { name: /Studio pickup · Los Angeles, CA/ }));

    for (const label of ['Street Address', 'City', 'State', 'ZIP Code']) {
      expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    }
    expect(screen.getByText(/No address needed/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Authorize & Pay/ }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/card number/);
    expect(alert).not.toHaveTextContent(/street|city|state|ZIP/);
  });

  it('asks for the address again on courier and nationwide shipping', () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('radio', { name: /Studio pickup/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Nationwide shipping/ }));
    expect(screen.getByLabelText('Street Address')).toBeInTheDocument();
    expect(screen.getByLabelText('ZIP Code')).toBeInTheDocument();
  });

  it('marks the payment method the shopper prefers', async () => {
    signInMockUser({ preferredPaymentMethod: 'apple_pay' });
    renderCheckout();
    expect(await screen.findByRole('button', { name: /Apple Pay.*Preferred/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google Pay' })).toBeInTheDocument();
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
