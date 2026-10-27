import { test, expect, type Page } from '@playwright/test';

async function freshStart(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });

test.describe('TerraScape smoke suite', () => {
  test('root redirects to the collection', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/collections$/);
    await expect(page.getByRole('link', { name: 'TerraScape home' })).toBeVisible();
  });

  test('header links reach every main page', async ({ page }) => {
    await page.goto('/collections');
    const pages: Array<[string, RegExp]> = [
      ['Our Story', /\/our-story$/],
      ['Studio', /\/studio$/],
      ['TerraCare', /\/terracare$/],
      ['FAQ', /\/faq$/],
      ['Collection', /\/collections$/],
    ];
    for (const [name, url] of pages) {
      await mainNav(page).getByRole('link', { name }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test('FAQ loads with every question closed', async ({ page }) => {
    await page.goto('/faq');
    const questions = page.locator('.faq-question-btn');
    await expect(questions.first()).toBeVisible();
    await expect(page.locator('.faq-question-btn[aria-expanded="true"]')).toHaveCount(0);
  });

  test('a Studio design goes into the jar at catalog prices', async ({ page }) => {
    await freshStart(page, '/studio');

    await page.getByRole('radio', { name: /Tall Apothecary Jar · Smooth Lid/ }).click();
    await page.getByRole('button', { name: /02\s*Foundation/ }).click();
    await page.getByRole('radio', { name: /Pacific Forest Floor/ }).click();
    await page.getByRole('button', { name: /03\s*Flora/ }).click();
    await page.getByRole('checkbox', { name: /Button Fern/ }).click();
    await page.getByRole('button', { name: /04\s*Details/ }).click();
    await page.getByRole('button', { name: /Add to Your Jar/ }).click();

    const jar = page.getByRole('dialog', { name: /Your Jar/ });
    await expect(jar).toBeVisible();
    // $124 design + $25 studio assembly + $18 courier + $15.87 tax
    await expect(jar.getByText('$182.87 USD')).toBeVisible();

    // Shipping nationwide turns the build into a DIY kit: $124 + $18 + $13.49 tax
    await jar.getByRole('radio', { name: /Nationwide shipping/ }).check();
    await expect(jar.getByText('$155.49 USD')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(jar).toBeHidden();
  });

  test('studio editions are limited to one per order', async ({ page }) => {
    await freshStart(page, '/editions/moss_garden');
    await page.getByRole('button', { name: /Add to Your Jar/ }).first().click();

    const jar = page.getByRole('dialog', { name: /Your Jar/ });
    await expect(jar.getByRole('button', { name: 'Increase quantity (limit reached)' })).toBeDisabled();
  });

  test('unknown links show the not-found page', async ({ page }) => {
    await page.goto('/editions/not-a-real-edition');
    await expect(page.getByText('Page not found', { exact: true })).toBeVisible();
    await expect(page).toHaveTitle(/Page not found/);
    await page.getByRole('button', { name: /Browse the collection/ }).click();
    await expect(page).toHaveURL(/\/collections$/);
  });

  test('phones get one header row and a working menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await freshStart(page, '/collections');

    // Measure once the web fonts are in; the wider fallback fonts can wrap the row briefly
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('.site-header');
    expect((await header.boundingBox())?.height ?? 999).toBeLessThan(80);

    await page.getByRole('button', { name: 'Open menu' }).click();
    await mainNav(page).getByRole('link', { name: 'TerraCare' }).click();
    await expect(page).toHaveURL(/\/terracare$/);
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('no page scrolls sideways on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ['/collections', '/studio', '/our-story', '/terracare', '/faq', '/editions/fern_study', '/account']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, path).toBeLessThanOrEqual(2);
    }
  });
});
