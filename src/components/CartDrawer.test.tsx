import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { CartDrawer } from './CartDrawer';
import { AllProviders } from '../test/test-utils';
import { useCart } from '../context/CartContext';

// Test host to drive CartContext actions
function CartTestHost() {
  const { openCart, addStandardItem } = useCart();

  return (
    <div>
      <button onClick={openCart}>Open Cart Drawer</button>
      <button
        onClick={() =>
          addStandardItem({
            name: 'Aquascaping Pinsettes & Trimmer',
            sku: 'ACC-PINSETTE',
            type: 'accessory',
            price: 28,
          })
        }
      >
        Add Test Item
      </button>
      <CartDrawer />
    </div>
  );
}

describe('CartDrawer Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render dialog when closed', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders empty jar state when opened with 0 items', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Open Cart Drawer'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Your jar is currently empty/i)).toBeInTheDocument();
  });

  it('renders added items with price and details', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Add Test Item'));
    fireEvent.click(screen.getByText('Open Cart Drawer'));

    expect(screen.getByText('Aquascaping Pinsettes & Trimmer')).toBeInTheDocument();
    expect(screen.getByText('ACC-PINSETTE')).toBeInTheDocument();
    expect(screen.getByText('$28')).toBeInTheDocument();
  });

  it('increments item quantity and updates total when plus button is clicked', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Add Test Item'));
    fireEvent.click(screen.getByText('Open Cart Drawer'));

    const increaseBtn = screen.getByTitle('Increase quantity');
    fireEvent.click(increaseBtn);

    expect(screen.getByText('$56')).toBeInTheDocument();
  });

  it('removes item when Remove button is clicked', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Add Test Item'));
    fireEvent.click(screen.getByText('Open Cart Drawer'));

    expect(screen.getByText('Aquascaping Pinsettes & Trimmer')).toBeInTheDocument();

    const removeBtn = screen.getByTitle('Remove item');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Aquascaping Pinsettes & Trimmer')).not.toBeInTheDocument();
    expect(screen.getByText(/Your jar is currently empty/i)).toBeInTheDocument();
  });

  it('closes cart on Escape key press', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Open Cart Drawer'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
