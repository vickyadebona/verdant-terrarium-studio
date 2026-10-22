import { describe, it, expect } from 'vitest';
import { validateCartPricing, createStripeOrder } from './stripeCheckoutEngine';
import { VESSELS, SUBSTRATES, CATALOG_ITEMS, HARDWARE_MODULES } from '../data';
import type { CartItem, SerializedBlueprint } from '../types/terrarium';

describe('stripeCheckoutEngine utilities', () => {
  const sampleBlueprint: SerializedBlueprint = {
    blueprintVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    fulfillmentType: 'assembled_local',
    estimatedTotalUSD: 165,
    vessel: {
      id: VESSELS[0].id,
      sku: VESSELS[0].sku,
      name: VESSELS[0].name,
      price: VESSELS[0].price,
    },
    hardwareModules: [
      {
        id: HARDWARE_MODULES[0].id,
        sku: HARDWARE_MODULES[0].sku,
        name: HARDWARE_MODULES[0].name,
        price: HARDWARE_MODULES[0].price,
      },
    ],
    substrateStackBottomToTop: [
      {
        layerOrder: 1,
        sku: SUBSTRATES[0].sku,
        name: SUBSTRATES[0].name,
        depthMm: 25,
        slopeWave: 'flat',
        price: SUBSTRATES[0].pricePerLayer,
      },
    ],
    specimens: [
      {
        sku: CATALOG_ITEMS[0].sku,
        name: CATALOG_ITEMS[0].name,
        coordinates: { x: 100, y: 100 },
        scale: 1,
        rotationDeg: 0,
        flippedHorizontally: false,
        zIndex: 1,
        price: CATALOG_ITEMS[0].price,
      },
    ],
  };

  const expectedBlueprintUnitPrice =
    VESSELS[0].price +
    SUBSTRATES[0].pricePerLayer +
    CATALOG_ITEMS[0].price +
    HARDWARE_MODULES[0].price +
    25; // 25 for assembled_local

  describe('validateCartPricing', () => {
    it('validates a legitimate custom blueprint cart item without tamper flag', () => {
      const items: CartItem[] = [
        {
          id: 'cart-1',
          type: 'custom_blueprint',
          sku: 'TERRA-CUSTOM-001',
          name: 'Custom Terrarium',
          price: expectedBlueprintUnitPrice,
          quantity: 1,
          blueprint: sampleBlueprint,
          fulfillmentType: 'assembled_local',
        },
      ];

      const result = validateCartPricing(items, 'assembled_local');

      expect(result.valid).toBe(true);
      expect(result.tamperDetected).toBe(false);
      expect(result.subtotal).toBe(expectedBlueprintUnitPrice);
      expect(result.shippingFee).toBe(18); // assembled default courier fee
      expect(result.taxAmount).toBe(Math.round((result.subtotal + result.shippingFee) * 0.095));
      expect(result.total).toBe(result.subtotal + result.shippingFee + result.taxAmount);
      expect(result.itemizedLineItems).toHaveLength(1);
      expect(result.itemizedLineItems[0].unitPrice).toBe(expectedBlueprintUnitPrice);
    });

    it('detects price tampering when client price does not match master catalog sum', () => {
      const tamperedItems: CartItem[] = [
        {
          id: 'cart-1',
          type: 'custom_blueprint',
          sku: 'TERRA-CUSTOM-001',
          name: 'Custom Terrarium',
          price: 1.0, // Tampered client price!
          quantity: 1,
          blueprint: sampleBlueprint,
          fulfillmentType: 'assembled_local',
        },
      ];

      const result = validateCartPricing(tamperedItems, 'assembled_local');

      expect(result.valid).toBe(true);
      expect(result.tamperDetected).toBe(true);
      // Subtotal should be corrected back to verified master cost
      expect(result.subtotal).toBe(expectedBlueprintUnitPrice);
    });

    it('applies complimentary free shipping for shipped orders with subtotal >= $150', () => {
      const items: CartItem[] = [
        {
          id: 'acc-1',
          type: 'accessory',
          sku: 'ACC-TOOLKIT',
          name: 'Terrarium Aquascaping Toolkit',
          price: 160,
          quantity: 1,
          fulfillmentType: 'diy_kit',
        },
      ];

      const result = validateCartPricing(items, 'diy_kit');

      expect(result.subtotal).toBe(160);
      expect(result.shippingFee).toBe(0);
      expect(result.total).toBe(160 + Math.round(160 * 0.095));
    });

    it('charges standard $18 shipping for shipped orders with subtotal < $150', () => {
      const items: CartItem[] = [
        {
          id: 'acc-1',
          type: 'accessory',
          sku: 'ACC-MIST',
          name: 'Glass Plant Mister',
          price: 45,
          quantity: 1,
          fulfillmentType: 'diy_kit',
        },
      ];

      const result = validateCartPricing(items, 'diy_kit');

      expect(result.subtotal).toBe(45);
      expect(result.shippingFee).toBe(18);
    });

    it('correctly calculates hardware module stand-alone items', () => {
      const hwModule = HARDWARE_MODULES[0];
      const items: CartItem[] = [
        {
          id: 'hw-1',
          type: 'hardware',
          sku: hwModule.sku,
          name: hwModule.name,
          price: hwModule.price,
          quantity: 2,
        },
      ];

      const result = validateCartPricing(items, 'diy_kit');

      expect(result.subtotal).toBe(hwModule.price * 2);
      expect(result.itemizedLineItems[0].lineTotal).toBe(hwModule.price * 2);
    });
  });

  describe('createStripeOrder', () => {
    it('creates an authoritative OrderStatusInfo with initial BLUEPRINT_RECEIVED stage', () => {
      const items: CartItem[] = [
        {
          id: 'cart-1',
          type: 'custom_blueprint',
          sku: 'TERRA-CUSTOM-001',
          name: 'Custom Terrarium',
          price: expectedBlueprintUnitPrice,
          quantity: 1,
          blueprint: sampleBlueprint,
          fulfillmentType: 'assembled_local',
        },
      ];

      const { order, stripeIntent } = createStripeOrder({
        items,
        customer: {
          name: 'Jane Botanist',
          email: 'jane@example.com',
          phone: '555-0199',
        },
        shipping: {
          street: '123 Flora Way',
          city: 'San Francisco',
          state: 'CA',
          zip: '94110',
          deliveryMethod: 'assembled_local',
          deliveryOptionTitle: 'Studio White-Glove Courier',
        },
        paymentMethod: {
          brand: 'visa',
          last4: '4242',
        },
      });

      // Verify order identity and tracking
      expect(order.orderId).toMatch(/^TS-\d{4}-\d{4}$/);
      expect(order.customerName).toBe('Jane Botanist');
      expect(order.customerEmail).toBe('jane@example.com');
      expect(order.currentStage).toBe('BLUEPRINT_RECEIVED');
      expect(order.stageHistory).toHaveLength(1);
      expect(order.stageHistory[0].stage).toBe('BLUEPRINT_RECEIVED');
      expect(order.stageHistory[0].technician).toContain('Andrew Hung');

      // Verify simulated Stripe PaymentIntent payload
      expect(stripeIntent.object).toBe('payment_intent');
      expect(stripeIntent.status).toBe('succeeded');
      expect(stripeIntent.currency).toBe('usd');
      expect(stripeIntent.amount).toBe(Math.round(order.total * 100)); // Cents conversion
      expect((stripeIntent as any).metadata.order_id).toBe(order.orderId);
    });
  });
});
