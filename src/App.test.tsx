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
