import { describe, it, expect } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { CartDrawer } from '../components/CartDrawer';
import { AuthModal } from '../components/AuthModal';
import { AllProviders } from '../test/test-utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function DialogsHost() {
  const { openCart } = useCart();
  const { openAuthModal } = useAuth();
  return (
    <div>
      <button onClick={openCart}>Open Jar</button>
      <button onClick={() => openAuthModal()}>Open Sign In</button>
      <CartDrawer />
      <AuthModal />
    </div>
  );
}

function renderHost() {
  render(
    <AllProviders>
      <DialogsHost />
    </AllProviders>
  );
}

describe('dialog focus handling', () => {
  it('moves focus into the jar and back to the opener when it closes', () => {
    renderHost();
    const opener = screen.getByRole('button', { name: 'Open Jar' });
    opener.focus();
    fireEvent.click(opener);

    const jar = screen.getByRole('dialog', { name: /Your Jar/ });
    expect(jar).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Your Jar/ })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('keeps Tab inside the open dialog', () => {
    renderHost();
    fireEvent.click(screen.getByRole('button', { name: 'Open Jar' }));
    const jar = screen.getByRole('dialog', { name: /Your Jar/ });
    const buttons = jar.querySelectorAll<HTMLElement>('button');
    const last = buttons[buttons.length - 1];

    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(jar.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(last);
  });

  it('closes only the top dialog on Escape', () => {
    renderHost();
    fireEvent.click(screen.getByRole('button', { name: 'Open Jar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Sign In' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: /Your Jar/ })).toBeInTheDocument();
  });
});
