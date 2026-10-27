import { describe, it, expect } from 'vitest';
import { catalogProducts } from '../../prisma/seed';
import { STUDIO_OPTIONS, EDITION_PRODUCTS, ACCESSORY_PRODUCTS, getProduct } from '../catalog';

describe('database seed', () => {
  const products = catalogProducts();

  it('includes every catalog product exactly once', () => {
    const expected = STUDIO_OPTIONS.length + Object.keys(EDITION_PRODUCTS).length + Object.keys(ACCESSORY_PRODUCTS).length;
    expect(products).toHaveLength(expected);
    expect(new Set(products.map((p) => p.sku)).size).toBe(expected);
    expect(new Set(products.map((p) => p.slug)).size).toBe(expected);
  });

  it('copies prices in cents straight from the catalog', () => {
    for (const product of products) {
      expect(product.priceCents).toBe(getProduct(product.sku)?.priceCents);
      expect(Number.isInteger(product.priceCents)).toBe(true);
    }
  });

  it('limits editions to one per order', () => {
    const editions = products.filter((p) => p.kind === 'EDITION');
    expect(editions).toHaveLength(3);
    expect(editions.every((p) => p.maxPerOrder === 1)).toBe(true);
  });
});
