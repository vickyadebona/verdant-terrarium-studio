import { describe, it, expect } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { OrderTrackerModal } from './OrderTrackerModal';
import { AllProviders } from '../test/test-utils';
import { useCart } from '../context/CartContext';
import { createStripeOrder } from '../utils/stripeCheckoutEngine';
import { ACCESSORY_PRODUCTS } from '../catalog';

function TrackerTestHost() {
  const { openTrackerModal } = useCart();
  return (
    <div>
      <button onClick={() => openTrackerModal()}>Open Tracker</button>
      <OrderTrackerModal />
    </div>
  );
}

describe('OrderTrackerModal', () => {
  it('credits saved orders to the team, not a named person', () => {
    const { order } = createStripeOrder({
      items: [
        {
          id: 'hw-1',
          type: 'hardware',
          sku: ACCESSORY_PRODUCTS.copperMicroLeds.sku,
          name: ACCESSORY_PRODUCTS.copperMicroLeds.name,
          unitPriceCents: ACCESSORY_PRODUCTS.copperMicroLeds.priceCents,
          quantity: 1,
        },
      ],
      customer: { name: 'Test Customer', email: 'customer@example.test' },
      shipping: { street: '1 Test St', city: 'Testville', state: 'CA', zip: '90001', shippingOption: 'shipped' },
      paymentMethod: { brand: 'visa', last4: '4242' },
    });
    // An order saved by an older build that named a person.
    const legacyOrder = {
      ...order,
      stageHistory: order.stageHistory.map((entry) => ({
        ...entry,
        technician: 'Legacy Person (Lead)',
        notes: 'Legacy Person queued the build tray.',
      })),
    };
    localStorage.setItem('terrascape_orders_v2', JSON.stringify([legacyOrder]));

    render(
      <AllProviders>
        <TrackerTestHost />
      </AllProviders>
    );
    fireEvent.click(screen.getByText('Open Tracker'));

    expect(screen.getByText('Logged by: Our team')).toBeInTheDocument();
    expect(screen.queryByText(/Legacy Person/)).not.toBeInTheDocument();
  });
});
