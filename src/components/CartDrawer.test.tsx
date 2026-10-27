import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render, within, act } from '@testing-library/react';
import { CartDrawer } from './CartDrawer';
import { AllProviders } from '../test/test-utils';
import { useCart } from '../context/CartContext';
import { buildStudioBlueprint } from '../catalog/studioBlueprint';
import { SOIL_RECIPES } from '../catalog';

// Test host to drive CartContext actions
function CartTestHost() {
  const { openCart, addStandardItem } = useCart();

  return (
    <div>
      <button onClick={openCart}>Open Cart Drawer</button>
      <button
        onClick={() =>
          addStandardItem({
            name: 'Submersible Warm Copper Micro-LEDs',
            sku: 'HW-LGT-CPR3',
            type: 'hardware',
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

  it('renders the empty greenhouse when opened with 0 items', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Open Cart Drawer'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Your greenhouse is empty/i)).toBeInTheDocument();
  });

  it('renders added items with price and details', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Add Test Item'));
    fireEvent.click(screen.getByText('Open Cart Drawer'));

    expect(screen.getByText('Submersible Warm Copper Micro-LEDs')).toBeInTheDocument();
    const line = screen.getByRole('group', { name: 'Submersible Warm Copper Micro-LEDs' });
    expect(within(line).getByText('HW-LGT-CPR3')).toBeInTheDocument();
    expect(within(line).getByText('$18')).toBeInTheDocument();
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

    expect(screen.getByText('$36')).toBeInTheDocument();
  });

  it('removes item when Remove button is clicked', () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );

    fireEvent.click(screen.getByText('Add Test Item'));
    fireEvent.click(screen.getByText('Open Cart Drawer'));

    expect(screen.getByText('Submersible Warm Copper Micro-LEDs')).toBeInTheDocument();

    const removeBtn = screen.getByTitle('Remove item');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Submersible Warm Copper Micro-LEDs')).not.toBeInTheDocument();
    expect(screen.getByText(/Your greenhouse is empty/i)).toBeInTheDocument();
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

  it('reprices a saved build that carried its own fulfillment and assembly fee', () => {
    const blueprint = buildStudioBlueprint(['jar_smooth', 'forest', 'fern', 'stone'], SOIL_RECIPES.forest);
    if (!blueprint.ok) throw new Error('blueprint');
    localStorage.setItem(
      'terrascape_cart_v2',
      JSON.stringify([
        {
          id: 'legacy-1',
          type: 'custom_blueprint',
          sku: 'CUSTOM-BUILD',
          name: 'Custom Tall Apothecary Jar · Smooth Lid',
          unitPriceCents: 14900,
          quantity: 1,
          fulfillmentType: 'diy_kit_shipped',
          blueprint: blueprint.blueprint,
        },
      ])
    );
    localStorage.setItem('terrascape_delivery_v1', 'pickup');

    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );
    fireEvent.click(screen.getByText('Open Cart Drawer'));

    // The line shows the catalog price; the order-level pickup choice adds assembly once.
    // $84 jar + $22 foundation + $18 fern + $11 river stone
    expect(screen.getByText('$135')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Studio pickup/ })).toBeChecked();
    expect(screen.getByText('Studio assembly (1 build)').nextElementSibling).toHaveTextContent('$25.00');
  });
});

describe('Greenhouse across browser tabs', () => {
  it('empties when another tab empties it, and does not write the old greenhouse back', async () => {
    render(
      <AllProviders>
        <CartTestHost />
      </AllProviders>
    );
    fireEvent.click(screen.getByText('Add Test Item'));
    expect(JSON.parse(localStorage.getItem('terrascape_cart_v2') ?? '[]')).toHaveLength(1);

    // Another tab checks out: it empties the saved greenhouse and the browser tells this tab.
    act(() => {
      localStorage.setItem('terrascape_cart_v2', '[]');
      window.dispatchEvent(new StorageEvent('storage', { key: 'terrascape_cart_v2', storageArea: localStorage }));
    });

    expect(screen.getByRole('dialog')).toHaveTextContent(/Your greenhouse is empty/i);
    expect(JSON.parse(localStorage.getItem('terrascape_cart_v2') ?? '[]')).toEqual([]);
  });
});
