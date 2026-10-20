import type {
  CartItem,
  FulfillmentType,
  OrderStatusInfo,
  OrderStage,
  SerializedBlueprint,
  StageHistoryEntry,
} from '../types/terrarium';
import { CATALOG_ITEMS, HARDWARE_MODULES, SUBSTRATES, VESSELS } from '../data';

export interface CheckoutCustomerData {
  name: string;
  email: string;
  phone?: string;
}

export interface CheckoutShippingData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  deliveryMethod: FulfillmentType;
  deliveryOptionTitle: string;
  deliveryNotes?: string;
}

export interface ValidationResult {
  valid: boolean;
  tamperDetected: boolean;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  itemizedLineItems: Array<{
    title: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

/**
 * Validates cart items against the authoritative catalog data to prevent client tampering.
 */
export function validateCartPricing(
  items: CartItem[],
  deliveryMethod: FulfillmentType
): ValidationResult {
  let subtotal = 0;
  let tamperDetected = false;
  const itemizedLineItems: ValidationResult['itemizedLineItems'] = [];

  for (const item of items) {
    if (item.type === 'custom_blueprint' && item.blueprint) {
      // Re-verify the blueprint using master data catalogs
      const vessel = VESSELS.find((v) => v.sku === item.blueprint?.vessel.sku);
      const vesselCost = vessel ? vessel.price : item.blueprint.vessel.price;

      const substrateCost = item.blueprint.substrateStackBottomToTop.reduce((sum, layer) => {
        const cfg = SUBSTRATES.find((s) => s.sku === layer.sku);
        return sum + (cfg ? cfg.pricePerLayer : layer.price);
      }, 0);

      const itemsCost = item.blueprint.specimens.reduce((sum, spec) => {
        const cat = CATALOG_ITEMS.find((c) => c.sku === spec.sku);
        return sum + (cat ? cat.price : spec.price);
      }, 0);

      const hardwareCost = item.blueprint.hardwareModules.reduce((sum, hw) => {
        const h = HARDWARE_MODULES.find((m) => m.sku === hw.sku);
        return sum + (h ? h.price : hw.price);
      }, 0);

      const assemblyFee = item.fulfillmentType === 'assembled_local' ? 25 : 0;
      const verifiedUnitCost = vesselCost + substrateCost + itemsCost + hardwareCost + assemblyFee;

      if (Math.abs(verifiedUnitCost - item.price) > 0.01) {
        tamperDetected = true;
      }

      const lineTotal = verifiedUnitCost * item.quantity;
      subtotal += lineTotal;

      itemizedLineItems.push({
        title: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: verifiedUnitCost,
        lineTotal,
      });
    } else if (item.type === 'hardware') {
      const hw = HARDWARE_MODULES.find((h) => h.sku === item.sku);
      const unitPrice = hw ? hw.price : item.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      itemizedLineItems.push({
        title: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    } else {
      // Signature builds or accessories
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;

      itemizedLineItems.push({
        title: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal,
      });
    }
  }

  // Calculate fulfillment fee:
  // - If any item is assembled_local and courier is chosen: $18 (or $0 for local studio pickup)
  // - For nationwide DIY kit shipped: Complimentary ($0) on orders >= $150, else $18
  const hasAssembled = items.some((i) => i.fulfillmentType === 'assembled_local') || deliveryMethod === 'assembled_local';
  let shippingFee = 0;
  if (!hasAssembled) {
    shippingFee = subtotal >= 150 ? 0 : 18;
  } else {
    // If local assembly, default to Studio Courier ($18) unless studio pickup selected
    shippingFee = 18;
  }

  // Tax calculation (estimated 9.5% for California origin or 8% standard)
  const taxAmount = Math.round((subtotal + shippingFee) * 0.095);
  const total = subtotal + shippingFee + taxAmount;

  return {
    valid: true,
    tamperDetected,
    subtotal,
    shippingFee,
    taxAmount,
    total,
    itemizedLineItems,
  };
}

/**
 * Creates an authoritative OrderStatusInfo record with initial BLUEPRINT_RECEIVED stage,
 * deterministic Stripe PaymentIntent simulation, and workshop tracking payload.
 */
export function createStripeOrder(params: {
  items: CartItem[];
  customer: CheckoutCustomerData;
  shipping: CheckoutShippingData;
  shippingFeeOverride?: number;
  paymentMethod: {
    brand: string;
    last4: string;
    wallet?: string;
  };
}): { order: OrderStatusInfo; stripeIntent: Record<string, unknown> } {
  const validation = validateCartPricing(params.items, params.shipping.deliveryMethod);
  const finalShippingFee =
    params.shippingFeeOverride !== undefined ? params.shippingFeeOverride : validation.shippingFee;
  const finalTax = Math.round((validation.subtotal + finalShippingFee) * 0.095);
  const finalTotal = validation.subtotal + finalShippingFee + finalTax;

  const now = new Date();
  const orderId = `TS-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentIntentId = `pi_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

  // Estimated delivery: 4 to 6 business days for quarantine and assembly
  const estDelivery = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const initialHistory: StageHistoryEntry[] = [
    {
      stage: 'BLUEPRINT_RECEIVED',
      timestamp: now.toISOString(),
      title: 'Blueprint Received & Queued in Studio',
      notes: `Order #${orderId} verified with ${params.items.length} build(s). BOM validated against master parts ledger. Andrew queued physical build tray.`,
      technician: 'Andrew Hung (Hardware & Vivarium Lead)',
    },
  ];

  const order: OrderStatusInfo = {
    orderId,
    customerName: params.customer.name,
    customerEmail: params.customer.email,
    shippingAddress: {
      street: params.shipping.street,
      city: params.shipping.city,
      state: params.shipping.state,
      zip: params.shipping.zip,
    },
    deliveryMethod: params.shipping.deliveryMethod,
    deliveryOptionTitle: params.shipping.deliveryOptionTitle,
    deliveryNotes: params.shipping.deliveryNotes,
    items: params.items,
    subtotal: validation.subtotal,
    shippingFee: finalShippingFee,
    taxAmount: finalTax,
    total: finalTotal,
    stripePaymentIntentId: paymentIntentId,
    paymentMethodDetails: params.paymentMethod,
    currentStage: 'BLUEPRINT_RECEIVED' as OrderStage,
    stageHistory: initialHistory,
    createdAt: now.toISOString(),
    estimatedDeliveryDate: estDelivery,
    trackingNumber: `1Z99999999${Math.floor(10000000 + Math.random() * 90000000)}`,
    carrier: 'UPS Ground / Shippo Insulated Cold-Chain',
  };

  // Serialized Stripe PaymentIntent Payload
  const stripeIntent = {
    id: paymentIntentId,
    object: 'payment_intent',
    amount: Math.round(finalTotal * 100), // in cents
    currency: 'usd',
    status: 'succeeded',
    customer: {
      name: params.customer.name,
      email: params.customer.email,
    },
    metadata: {
      order_id: orderId,
      terrascape_version: '1.0.0',
      item_count: params.items.length,
      delivery_mode: params.shipping.deliveryMethod,
      blueprints: JSON.stringify(
        params.items
          .filter((i) => i.blueprint)
          .map((i) => ({
            id: i.id,
            sku: i.sku,
            blueprint: i.blueprint as SerializedBlueprint,
          }))
      ),
    },
    payment_method_types: ['card', 'link', 'cashapp', 'klarna', 'affirm'],
    charges: {
      data: [
        {
          id: `ch_${Math.random().toString(36).slice(2, 10)}`,
          paid: true,
          amount_captured: Math.round(finalTotal * 100),
          receipt_url: `https://pay.stripe.com/receipts/terrascape/${orderId}`,
          payment_method_details: {
            type: 'card',
            card: {
              brand: params.paymentMethod.brand,
              last4: params.paymentMethod.last4,
              wallet: params.paymentMethod.wallet || null,
            },
          },
        },
      ],
    },
  };

  return { order, stripeIntent };
}
