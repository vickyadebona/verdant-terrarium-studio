import { describe, it, expect } from 'vitest';
import { greenhouseCountLabel } from './greenhouse';
import type { CartItem } from '../types/terrarium';

const item = (type: CartItem['type'], quantity: number): CartItem => ({
  id: `${type}-${quantity}`,
  type,
  name: type,
  sku: type,
  unitPriceCents: 100,
  quantity,
});

describe('greenhouseCountLabel', () => {
  it('counts custom builds and editions as jars, and accessories separately', () => {
    expect(greenhouseCountLabel([])).toBe('0 jars');
    expect(greenhouseCountLabel([item('custom_blueprint', 1)])).toBe('1 jar');
    expect(greenhouseCountLabel([item('custom_blueprint', 2), item('signature_build', 1)])).toBe('3 jars');
    expect(greenhouseCountLabel([item('signature_build', 1), item('hardware', 1)])).toBe('1 jar · 1 accessory');
    expect(greenhouseCountLabel([item('hardware', 2)])).toBe('0 jars · 2 accessories');
  });
});
