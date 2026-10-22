import { test, expect } from '@playwright/test';

test.describe('TerraScape Smoke & Navigation Suite', () => {
  test('loads home collections page and title correctly', async ({ page }) => {
    await page.goto('/');

    // Verify canonical redirect to /collections
    await expect(page).toHaveURL(/.*\/collections/);

    // Verify brand heading or navigation presence
    const brandOrNav = page.locator('text=TerraScape').first();
    await expect(brandOrNav).toBeVisible();

    // Verify navigation links
    await expect(page.locator('a[href*="studio"], button:has-text("Studio")').first()).toBeVisible();
  });

  test('navigates seamlessly between main sections', async ({ page }) => {
    await page.goto('/collections');

    // Navigate to Our Story
    const storyLink = page.locator('a[href*="our-story"], button:has-text("Our Story")').first();
    if (await storyLink.isVisible()) {
      await storyLink.click();
      await expect(page).toHaveURL(/.*\/our-story/);
    }

    // Navigate to FAQ
    const faqLink = page.locator('a[href*="faq"], button:has-text("FAQ")').first();
    if (await faqLink.isVisible()) {
      await faqLink.click();
      await expect(page).toHaveURL(/.*\/faq/);
    }

    // Navigate to Terracare
    const terracareLink = page.locator('a[href*="terracare"], button:has-text("Terracare")').first();
    if (await terracareLink.isVisible()) {
      await terracareLink.click();
      await expect(page).toHaveURL(/.*\/terracare/);
    }
  });

  test('loads Studio configurator and displays canvas', async ({ page }) => {
    await page.goto('/studio');

    // Studio canvas or vessel frame should be visible
    await expect(page.locator('svg').first()).toBeVisible();

    // Verify presence of configurator controls (Vessel / Substrates / Flora / Hardware)
    const studioTabsOrButtons = page.locator('button:has-text("Vessel"), button:has-text("Substrate"), button:has-text("Hardware")');
    await expect(studioTabsOrButtons.first()).toBeVisible();
  });

  test('opens and interacts with the Cart drawer', async ({ page }) => {
    await page.goto('/collections');

    // Find and click cart button in TopNavBar
    const cartButton = page.locator('button[aria-label*="cart" i], button:has(svg.lucide-shopping-bag)').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Drawer dialog should become visible
      const cartDialog = page.locator('[role="dialog"][aria-label*="Cart" i], [role="dialog"]:has-text("Your Jar")');
      await expect(cartDialog).toBeVisible();

      // Close drawer with Escape or close button
      await page.keyboard.press('Escape');
      await expect(cartDialog).not.toBeVisible();
    }
  });

  test('handles mobile viewport layout smoothly', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/studio');

    // Page should render without horizontal scroll overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // small subpixel tolerance
  });
});
