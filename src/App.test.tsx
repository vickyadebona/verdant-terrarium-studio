import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render, within } from '@testing-library/react';
import AppWithModals from './App';
import { AllProviders } from './test/test-utils';

function renderStudio() {
  window.history.replaceState(null, '', '/studio');
  return render(
    <AllProviders>
      <AppWithModals />
    </AllProviders>
  );
}

describe('Studio → Your Jar', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('asks for the missing vessel and foundation instead of adding an incomplete design', () => {
    renderStudio();

    fireEvent.click(screen.getByRole('button', { name: /04\s*Details/ }));
    fireEvent.click(screen.getByRole('button', { name: /Add to Your Jar/ }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a vessel and a foundation before adding your design to the jar.'
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Go to step 01 · Vessel/ }));
    expect(screen.getByRole('heading', { name: 'Choose your vessel.' })).toBeInTheDocument();
  });

  it('adds the design to the jar priced from the catalog', () => {
    renderStudio();

    fireEvent.click(screen.getByRole('radio', { name: /Tall Apothecary Jar · Smooth Lid/ }));
    fireEvent.click(screen.getByRole('button', { name: /02\s*Foundation/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Pacific Forest Floor/ }));
    fireEvent.click(screen.getByRole('button', { name: /03\s*Flora/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Button Fern/ }));
    fireEvent.click(screen.getByRole('button', { name: /04\s*Details/ }));
    fireEvent.click(screen.getByRole('button', { name: /Add to Your Jar/ }));

    const jar = screen.getByRole('dialog', { name: /Your Jar/ });
    expect(within(jar).getByText('Custom Tall Apothecary Jar · Smooth Lid')).toBeInTheDocument();
    // $84 jar + $22 foundation + $18 fern, plus $25 studio assembly for courier delivery
    expect(within(jar).getByText('$124')).toBeInTheDocument();
    expect(within(jar).getByText('Studio assembly (1 build)').nextElementSibling).toHaveTextContent('$25.00');
    expect(within(jar).getByRole('radio', { name: /Studio courier/ })).toBeChecked();

    // Shipping nationwide turns the build into a DIY kit and drops the assembly line.
    fireEvent.click(within(jar).getByRole('radio', { name: /Nationwide shipping/ }));
    expect(within(jar).queryByText(/Studio assembly \(/)).not.toBeInTheDocument();
    expect(within(jar).getByText('Pacific Forest Floor · 1 plant · 0 details')).toBeInTheDocument();

    // Guests can reopen the jar from the header.
    expect(screen.getByRole('button', { name: /Your Jar\s*1/ })).toBeInTheDocument();
  });
});

describe('FAQ page', () => {
  function renderAt(path: string) {
    window.history.replaceState(null, '', path);
    return render(
      <AllProviders>
        <AppWithModals />
      </AllProviders>
    );
  }

  const questionButtons = () =>
    screen.getAllByRole('button').filter((button) => button.hasAttribute('aria-expanded') && button.closest('.faq-accordion-item'));

  it('starts with every question closed', () => {
    renderAt('/faq');

    expect(questionButtons().length).toBeGreaterThan(0);
    for (const button of questionButtons()) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('closes opened questions after leaving and coming back', () => {
    renderAt('/faq');

    fireEvent.click(questionButtons()[0]);
    expect(questionButtons()[0]).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getAllByRole('link', { name: 'Our Story' })[0]);
    fireEvent.click(screen.getAllByRole('link', { name: 'FAQ' })[0]);

    for (const button of questionButtons()) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });
});

describe('Mobile menu', () => {
  function renderAt(path: string) {
    window.history.replaceState(null, '', path);
    return render(
      <AllProviders>
        <AppWithModals />
      </AllProviders>
    );
  }

  it('opens and closes the main navigation with an accessible toggle', () => {
    renderAt('/collections');

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'main-navigation');

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveClass('open');
  });

  it('closes after choosing a page', () => {
    renderAt('/collections');

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    fireEvent.click(within(nav).getByRole('link', { name: 'FAQ' }));

    expect(window.location.pathname).toBe('/faq');
    expect(nav).not.toHaveClass('open');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and returns focus to the menu button', () => {
    renderAt('/collections');

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.keyDown(window, { key: 'Escape' });

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});

describe('Not-found page', () => {
  it('shows for unknown links and keeps the typed URL', () => {
    window.history.replaceState(null, '', '/editions/not-a-real-edition');
    render(
      <AllProviders>
        <AppWithModals />
      </AllProviders>
    );

    expect(screen.getByText('Page not found', { exact: true })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/editions/not-a-real-edition');
    expect(document.title).toBe('Page not found · TerraScape');

    fireEvent.click(screen.getByRole('button', { name: /Browse the collection/ }));
    expect(window.location.pathname).toBe('/collections');
    expect(document.title).not.toBe('Page not found · TerraScape');
  });
});
