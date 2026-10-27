import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderSiteAt, signInAsTestUser } from '../test/test-utils';

function renderStudio() {
  return renderSiteAt('/studio');
}

describe('Studio → Your Jar', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts with the smooth lid chosen and an empty jar in the preview', () => {
    const { container } = renderStudio();

    expect(screen.getByRole('radio', { name: /Tall Apothecary Jar · Smooth Lid/ })).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelectorAll('.soil-layer-group')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Pacific Forest Floor/ }));
    expect(container.querySelectorAll('.soil-layer-group').length).toBeGreaterThan(0);
  });

  it('keeps each step closed until the one before it has a selection', () => {
    renderStudio();
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    // Step 02 is empty: Continue and the later step tabs are unavailable, with a hint.
    expect(screen.getByRole('heading', { name: 'Choose your foundation.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled();
    expect(screen.getByText('Choose a foundation to continue.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /03\s*Flora/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /04\s*Details/ })).toBeDisabled();
    // Going back is always allowed.
    expect(screen.getByRole('button', { name: /01\s*Vessel/ })).toBeEnabled();

    fireEvent.click(screen.getByRole('radio', { name: /Pacific Forest Floor/ }));
    expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByText('Choose at least one plant to continue.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /Button Fern/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    // Details are optional: the design can go to the jar with none chosen.
    expect(screen.getByRole('button', { name: /Add to Your Jar/ })).toBeEnabled();
    expect(screen.queryByText(/Choose at least one detail/)).not.toBeInTheDocument();
  });

  it('adds a design with no details to the jar', async () => {
    signInAsTestUser();
    renderStudio();
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Pacific Forest Floor/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Button Fern/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('button', { name: /Add to Your Jar/ }));

    const jar = await screen.findByRole('dialog', { name: /Your Jar/ });
    // $84 jar + $22 foundation + $18 fern
    expect(within(jar).getByText('$124')).toBeInTheDocument();
    expect(within(jar).getByText('Pacific Forest Floor · 1 plant · 0 details')).toBeInTheDocument();
  });

  it('reopens a saved session no further than its first empty step', () => {
    sessionStorage.setItem('terrascape_builder_selected_v1', JSON.stringify(['jar_ridged']));
    sessionStorage.setItem('terrascape_builder_category_v1', 'Details');
    renderStudio();
    expect(screen.getByRole('heading', { name: 'Choose your foundation.' })).toBeInTheDocument();
  });

  function designAndAdd() {
    fireEvent.click(screen.getByRole('radio', { name: /Tall Apothecary Jar · Smooth Lid/ }));
    fireEvent.click(screen.getByRole('button', { name: /02\s*Foundation/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Pacific Forest Floor/ }));
    fireEvent.click(screen.getByRole('button', { name: /03\s*Flora/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Button Fern/ }));
    fireEvent.click(screen.getByRole('button', { name: /04\s*Details/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /River Stone/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add to Your Jar/ }));
  }

  function expectDesignInJar(jar: HTMLElement) {
    expect(within(jar).getByText('Custom Tall Apothecary Jar · Smooth Lid')).toBeInTheDocument();
    // $84 jar + $22 foundation + $18 fern + $11 river stone, plus $25 studio assembly for courier delivery
    expect(within(jar).getByText('$135')).toBeInTheDocument();
    expect(within(jar).getByText('Studio assembly (1 build)').nextElementSibling).toHaveTextContent('$25.00');
    expect(within(jar).getByRole('radio', { name: /Studio courier/ })).toBeChecked();
  }

  it('lets guests design but asks them to sign in before adding to the jar', () => {
    renderStudio();
    expect(screen.queryByRole('button', { name: /Your Jar/ })).not.toBeInTheDocument();

    designAndAdd();

    expect(screen.getByRole('dialog', { name: 'Sign in to save it to your jar' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /Your Jar/ })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('terrascape_cart_v2') ?? '[]')).toEqual([]);
  });

  it('adds the design exactly once after a guest creates an account', async () => {
    renderStudio();
    designAndAdd();

    const signIn = screen.getByRole('dialog', { name: 'Sign in to save it to your jar' });
    fireEvent.change(within(signIn).getByLabelText('Full Name'), { target: { value: 'New Collector' } });
    fireEvent.change(within(signIn).getByLabelText('Email Address'), { target: { value: 'new@example.test' } });
    fireEvent.change(within(signIn).getByLabelText('Password'), { target: { value: 'test-password-1' } });
    fireEvent.click(within(signIn).getByRole('button', { name: /Create Account & Add to Your Jar/ }));

    const jar = await screen.findByRole('dialog', { name: /Your Jar/ }, { timeout: 2000 });
    expectDesignInJar(jar);
    expect(screen.getByRole('button', { name: /Your Jar\s*1/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('terrascape_cart_v2') ?? '[]')).toHaveLength(1);

    // Shipping nationwide turns the build into a DIY kit and drops the assembly line.
    fireEvent.click(within(jar).getByRole('radio', { name: /Nationwide shipping/ }));
    expect(within(jar).queryByText(/Studio assembly \(/)).not.toBeInTheDocument();
    expect(within(jar).getByText('Pacific Forest Floor · 1 plant · 1 detail')).toBeInTheDocument();
  });

  it('adds straight to the jar for signed-in shoppers', async () => {
    signInAsTestUser();
    renderStudio();
    designAndAdd();

    expect(screen.queryByRole('dialog', { name: 'Sign in to save it to your jar' })).not.toBeInTheDocument();
    expectDesignInJar(await screen.findByRole('dialog', { name: /Your Jar/ }));
  });
});

describe('FAQ page', () => {
  function renderAt(path: string) {
    return renderSiteAt(path);
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
    return renderSiteAt(path);
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
    renderSiteAt('/editions/not-a-real-edition');

    expect(screen.getByText('Page not found', { exact: true })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/editions/not-a-real-edition');

    fireEvent.click(screen.getByRole('button', { name: /Browse the collection/ }));
    expect(window.location.pathname).toBe('/collections');
  });
});

describe('After an order goes through', () => {
  it('empties the jar and starts the Studio over', async () => {
    signInAsTestUser();
    renderSiteAt('/studio');

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Pacific Forest Floor/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Button Fern/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('button', { name: /Add to Your Jar/ }));

    const jar = await screen.findByRole('dialog', { name: /Your Jar/ });
    fireEvent.click(within(jar).getByText('Proceed to Stripe Checkout'));
    const checkout = await screen.findByRole('dialog', { name: /Stripe Embedded Checkout/ });
    fireEvent.click(within(checkout).getByRole('radio', { name: /Studio pickup/ }));
    fireEvent.click(within(checkout).getByRole('button', { name: /Auto-fill Stripe 4242 Test Card/ }));
    fireEvent.click(within(checkout).getByRole('button', { name: /Authorize & Pay/ }));

    expect(await screen.findByRole('dialog', { name: /Workshop Assembly Tracker/ }, { timeout: 5000 })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('terrascape_cart_v2') ?? '[]')).toEqual([]);
    expect(screen.getByRole('button', { name: /Your Jar\s*0/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /Your Jar/ })).not.toBeInTheDocument();

    // The Studio is back to a fresh design: step 01 with only the smooth lid chosen.
    expect(screen.getByRole('heading', { name: 'Choose your vessel.' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Smooth Lid/ })).toHaveAttribute('aria-checked', 'true');
    expect(JSON.parse(sessionStorage.getItem('terrascape_builder_selected_v1') ?? '[]')).toEqual(['jar_smooth']);
  }, 10000);
});

describe('Our Story closing panel', () => {
  it('invites guests to create an account or log in', () => {
    renderSiteAt('/our-story');

    expect(screen.getByRole('heading', { name: /Save your worlds/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create an account/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Already have one\? Log in/ })).toHaveAttribute('href', '/account?mode=login');
  });

  it('sends signed-in shoppers to the Studio instead', async () => {
    signInAsTestUser();
    renderSiteAt('/our-story');

    expect(screen.queryByRole('button', { name: /Create an account/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Log in/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Design in the Studio/ }));
    expect(await screen.findByRole('heading', { name: /Choose your vessel/ })).toBeInTheDocument();
  });
});
