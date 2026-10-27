import { describe, it, expect } from 'vitest';
import { createStripeOrder, priceBlueprint, quoteOrder } from './stripeCheckoutEngine';
import { addBusinessDays, deliveryFeeLabel } from '../catalog/delivery';
import { buildStudioBlueprint } from '../catalog/studioBlueprint';
import {
  ACCESSORY_PRODUCTS,
  EDITION_PRODUCTS,
  SOIL_RECIPES,
  studioStartingPriceCents,
} from '../catalog';
import type { CartItem, SerializedBlueprint } from '../types/terrarium';

function studioBlueprint(selected: string[]): SerializedBlueprint {
  const result = buildStudioBlueprint(selected, SOIL_RECIPES.forest);
  if (!result.ok) throw new Error(`missing ${result.missing.join(', ')}`);
  return result.blueprint;
}

// Smooth jar $84 + forest $22 + 2 × fern $18 + river stone $11 = $153
const sampleBlueprint = studioBlueprint(['jar_smooth', 'forest', 'fern', 'fern', 'stone']);
const BLUEPRINT_CENTS = 15300;
const ASSEMBLY_CENTS = 2500;

function customItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'cart-1',
    type: 'custom_blueprint',
    sku: 'CUSTOM-BUILD',
    name: 'Custom Terrarium',
    unitPriceCents: BLUEPRINT_CENTS,
    quantity: 1,
    blueprint: sampleBlueprint,
    ...overrides,
  };
}

const copperLeds: CartItem = {
  id: 'hw-1',
  type: 'hardware',
  sku: ACCESSORY_PRODUCTS.copperMicroLeds.sku,
  name: ACCESSORY_PRODUCTS.copperMicroLeds.name,
  unitPriceCents: 1800,
  quantity: 1,
};

describe('buildStudioBlueprint', () => {
  it('reports every required step that is still empty', () => {
    const result = buildStudioBlueprint(['stone'], SOIL_RECIPES.forest);
    expect(result).toEqual({ ok: false, missing: ['Vessel', 'Foundation', 'Flora'] });
  });

  it('builds a design without any details', () => {
    const result = buildStudioBlueprint(['jar_smooth', 'forest', 'fern'], SOIL_RECIPES.forest);
    expect(result.ok && result.blueprint.elements.map((line) => line.sku)).toEqual(['FLR-FRN']);
  });

  it('collapses repeated option ids into quantities and keeps soil layers', () => {
    const fern = sampleBlueprint.elements.find((line) => line.sku === 'FLR-FRN');
    expect(fern?.quantity).toBe(2);
    expect(sampleBlueprint.vessel.sku).toBe('VSL-CIR-SM');
    expect(sampleBlueprint.foundation.layers.map((layer) => layer.sku)).toEqual([
      'SUB-LEC',
      'SUB-CHR',
      'SUB-HUM',
      'SUB-MOS',
    ]);
  });

  it('clamps soil depths to the Studio slider range', () => {
    const deep = SOIL_RECIPES.forest.map((layer) => ({ ...layer, depthMm: 400 }));
    const result = buildStudioBlueprint(['jar_smooth', 'forest', 'fern', 'stone'], deep);
    expect(result.ok && result.blueprint.foundation.layers.every((l) => l.depthMm === 48)).toBe(true);
  });
});

describe('priceBlueprint', () => {
  it('sums catalog prices in cents', () => {
    expect(priceBlueprint(sampleBlueprint)).toBe(BLUEPRINT_CENTS);
  });

  it('ignores client-supplied unit prices', () => {
    const cheap: SerializedBlueprint = {
      ...sampleBlueprint,
      vessel: { ...sampleBlueprint.vessel, unitPriceCents: 1 },
    };
    expect(priceBlueprint(cheap)).toBe(BLUEPRINT_CENTS);
  });

  it('rejects unknown SKUs and SKUs in the wrong slot', () => {
    expect(
      priceBlueprint({ ...sampleBlueprint, vessel: { ...sampleBlueprint.vessel, sku: 'VSL-GLB-01' } })
    ).toBeNull();
    expect(
      priceBlueprint({ ...sampleBlueprint, vessel: { ...sampleBlueprint.vessel, sku: 'FLR-FRN' } })
    ).toBeNull();
  });

  it('rejects quantities outside 1–5', () => {
    const tooMany: SerializedBlueprint = {
      ...sampleBlueprint,
      elements: [{ sku: 'FLR-FRN', name: 'Button Fern', quantity: 6, unitPriceCents: 1800 }],
    };
    expect(priceBlueprint(tooMany)).toBeNull();
  });
});

describe('quoteOrder', () => {
  it('adds studio assembly as its own line for courier delivery', () => {
    const quote = quoteOrder([customItem()], 'courier');

    expect(quote.valid).toBe(true);
    expect(quote.tamperDetected).toBe(false);
    expect(quote.subtotalCents).toBe(BLUEPRINT_CENTS);
    expect(quote.assemblyCents).toBe(ASSEMBLY_CENTS);
    expect(quote.shippingCents).toBe(1800);
    expect(quote.taxCents).toBe(1862); // 9.5% of $196.00, to the cent
    expect(quote.totalCents).toBe(BLUEPRINT_CENTS + ASSEMBLY_CENTS + 1800 + 1862);
  });

  it('charges assembly per custom build, for pickup too, and never for editions or hardware', () => {
    const edition: CartItem = {
      id: 'ed-1',
      type: 'signature_build',
      sku: EDITION_PRODUCTS.moss_garden.sku,
      name: 'Moss Garden',
      unitPriceCents: 13800,
      quantity: 1,
    };
    const quote = quoteOrder([customItem({ quantity: 2 }), edition, copperLeds], 'pickup');
    expect(quote.assemblyCents).toBe(2 * ASSEMBLY_CENTS);
    expect(quote.shippingCents).toBe(0);
  });

  it('ships custom builds as DIY kits without assembly', () => {
    const quote = quoteOrder([customItem()], 'shipped');
    expect(quote.assemblyCents).toBe(0);
    expect(quote.subtotalCents).toBe(BLUEPRINT_CENTS);
    expect(quote.shippingCents).toBe(0); // free over $150
  });

  it('flags and corrects a tampered client price', () => {
    const quote = quoteOrder([customItem({ unitPriceCents: 100 })], 'courier');
    expect(quote.tamperDetected).toBe(true);
    expect(quote.subtotalCents).toBe(BLUEPRINT_CENTS);
  });

  it('charges shipping under $150 and nothing for studio pickup', () => {
    expect(quoteOrder([copperLeds], 'shipped').shippingCents).toBe(1800);
    expect(quoteOrder([copperLeds], 'pickup').shippingCents).toBe(0);
  });

  it('prices editions from the catalog', () => {
    const edition: CartItem = {
      id: 'ed-1',
      type: 'signature_build',
      sku: EDITION_PRODUCTS.fern_study.sku,
      name: 'Fern Study',
      unitPriceCents: 1,
      quantity: 1,
    };
    const quote = quoteOrder([edition], 'courier');
    expect(quote.subtotalCents).toBe(16200);
    expect(quote.assemblyCents).toBe(0);
    expect(quote.tamperDetected).toBe(true);
  });

  it('is invalid for an empty cart and charges nothing', () => {
    const quote = quoteOrder([], 'courier');
    expect(quote.valid).toBe(false);
    expect(quote.totalCents).toBe(0);
  });

  it('is invalid when a SKU is not in the catalog', () => {
    const unknown: CartItem = { ...copperLeds, sku: 'ACC-PINSETTE' };
    const quote = quoteOrder([copperLeds, unknown], 'shipped');
    expect(quote.valid).toBe(false);
    expect(quote.unknownSkus).toEqual(['ACC-PINSETTE']);
  });
});

describe('studioStartingPriceCents', () => {
  it('is the cheapest option in each required step', () => {
    // Smooth jar $84 + Pacific Forest $22 + Selaginella $15 (details are optional)
    expect(studioStartingPriceCents()).toBe(12100);
  });
});

describe('delivery promises', () => {
  it('labels fees from the same constants the quote uses', () => {
    expect(deliveryFeeLabel('courier')).toBe('$18');
    expect(deliveryFeeLabel('pickup')).toBe('Free');
    expect(deliveryFeeLabel('shipped')).toBe('$18 · free over $150');
    expect(deliveryFeeLabel('shipped', 16200)).toBe('Free');
  });

  it('counts business days, skipping weekends', () => {
    const friday = new Date(2026, 9, 23);
    expect(addBusinessDays(friday, 1).getDate()).toBe(26); // Monday
    expect(addBusinessDays(friday, 7).getDate()).toBe(3); // Tuesday, Nov 3
  });
});

describe('createStripeOrder', () => {
  const customer = { name: 'Jane Botanist', email: 'jane@example.com', phone: '555-0199' };
  const shipping = {
    street: '123 Flora Way',
    city: 'San Francisco',
    state: 'CA',
    zip: '94110',
    shippingOption: 'courier' as const,
  };

  it('creates an order at the BLUEPRINT_RECEIVED stage with verified cents', () => {
    const { order, stripeIntent } = createStripeOrder({
      items: [customItem({ unitPriceCents: 100 })],
      customer,
      shipping,
      paymentMethod: { brand: 'visa', last4: '4242' },
    });

    expect(order.orderId).toMatch(/^TS-\d{4}-\d{4}$/);
    expect(order.currentStage).toBe('BLUEPRINT_RECEIVED');
    expect(order.stageHistory[0].technician).toBe('Our team');
    expect(order.stageHistory[0].notes).not.toMatch(/Andrew/);
    expect(order.deliveryMethod).toBe('assembled_local');
    expect(order.items[0].unitPriceCents).toBe(BLUEPRINT_CENTS);
    expect(order.assemblyCents).toBe(ASSEMBLY_CENTS);
    expect(order.deliveryOptionTitle).toBe('Studio courier · Southern California');
    expect(order.carrier).toBe('TerraScape Studio Courier');
    expect(order.trackingNumber).toBeUndefined();
    expect(order.totalCents).toBe(
      order.subtotalCents + (order.assemblyCents ?? 0) + order.shippingCents + order.taxCents
    );
    expect(stripeIntent.amount).toBe(order.totalCents);
    expect(stripeIntent.currency).toBe('usd');
  });

  it('records shipped orders as DIY kits with a carrier tracking number', () => {
    const { order } = createStripeOrder({
      items: [customItem()],
      customer,
      shipping: { ...shipping, shippingOption: 'shipped' },
      paymentMethod: { brand: 'visa', last4: '4242' },
    });
    expect(order.deliveryMethod).toBe('diy_kit_shipped');
    expect(order.assemblyCents).toBe(0);
    expect(order.trackingNumber).toMatch(/^1Z/);
  });

  it('refuses to create an order for an empty cart', () => {
    expect(() =>
      createStripeOrder({
        items: [],
        customer,
        shipping,
        paymentMethod: { brand: 'visa', last4: '4242' },
      })
    ).toThrow('Your greenhouse is empty.');
  });
});

describe('edition quantity limit', () => {
  it('rejects more editions than EDITION_MAX_QUANTITY allows', () => {
    const editions: CartItem = {
      id: 'ed-2',
      type: 'signature_build',
      sku: EDITION_PRODUCTS.moss_garden.sku,
      name: 'Moss Garden',
      unitPriceCents: 13800,
      quantity: 2,
    };
    const quote = quoteOrder([editions], 'courier');
    expect(quote.valid).toBe(false);
    expect(quote.unknownSkus).toEqual([EDITION_PRODUCTS.moss_garden.sku]);
  });
});
