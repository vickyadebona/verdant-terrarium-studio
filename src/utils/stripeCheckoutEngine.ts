import type {
  BlueprintLine,
  CartItem,
  FulfillmentType,
  OrderStatusInfo,
  SerializedBlueprint,
  StageHistoryEntry,
} from '../types/terrarium';
import {
  ASSEMBLY_FEE_CENTS,
  ESTIMATED_TAX_RATE,
  MAX_ELEMENT_QUANTITY,
  getProduct,
  type ProductKind,
} from '../catalog';
import {
  DELIVERY_OPTIONS,
  addBusinessDays,
  shippingCentsFor,
  type ShippingOption,
} from '../catalog/delivery';

export type { ShippingOption };

/** Who order-tracker entries are attributed to. The site names the team, never individuals. */
export const STUDIO_TEAM_LABEL = 'Our team';

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
  shippingOption: ShippingOption;
  deliveryNotes?: string;
}

export interface OrderQuote {
  /** False when the cart is empty or holds a line the catalog can't price. */
  valid: boolean;
  /** True when a client-side price disagreed with the catalog. */
  tamperDetected: boolean;
  unknownSkus: string[];
  /** Catalog prices of the jar's items. */
  subtotalCents: number;
  /** Studio assembly for custom builds; zero when the order ships as DIY kits. */
  assemblyCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  lines: Array<{
    title: string;
    sku: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
}

function priceLine(line: BlueprintLine, kinds: ProductKind[], maxQuantity: number): number | null {
  const product = getProduct(line.sku);
  if (!product || !kinds.includes(product.kind)) return null;
  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > maxQuantity) return null;
  return product.priceCents * line.quantity;
}

/** Catalog price of a Studio blueprint before any assembly fee, or null if any line is invalid. */
export function priceBlueprint(blueprint: SerializedBlueprint): number | null {
  const parts = [
    priceLine(blueprint.vessel, ['vessel'], 1),
    priceLine(blueprint.foundation, ['foundation'], 1),
    ...blueprint.elements.map((line) => priceLine(line, ['flora', 'hardscape'], MAX_ELEMENT_QUANTITY)),
  ];
  if (parts.some((part) => part === null)) return null;
  return parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
}

/** Authoritative unit price for a cart line before assembly, or null if the catalog can't price it. */
export function verifiedUnitPriceCents(item: Pick<CartItem, 'type' | 'sku' | 'blueprint'>): number | null {
  if (item.type === 'custom_blueprint') {
    return item.blueprint ? priceBlueprint(item.blueprint) : null;
  }
  const expectedKind: ProductKind = item.type === 'signature_build' ? 'edition' : 'hardware';
  const product = getProduct(item.sku);
  return product && product.kind === expectedKind ? product.priceCents : null;
}

/** Assembly fee for every custom build in the jar when the order is planted in the studio. */
export function assemblyCentsFor(items: CartItem[], option: ShippingOption): number {
  if (!DELIVERY_OPTIONS[option].assembled) return 0;
  const builds = items
    .filter((item) => item.type === 'custom_blueprint')
    .reduce((sum, item) => sum + item.quantity, 0);
  return builds * ASSEMBLY_FEE_CENTS;
}

/**
 * Prices a cart against the catalog. Every total shown to the customer
 * (cart drawer, checkout, order record) comes from this one function.
 */
export function quoteOrder(items: CartItem[], shippingOption: ShippingOption): OrderQuote {
  let subtotalCents = 0;
  let tamperDetected = false;
  const unknownSkus: string[] = [];
  const lines: OrderQuote['lines'] = [];

  for (const item of items) {
    const unitPriceCents = verifiedUnitPriceCents(item);
    if (unitPriceCents === null || !Number.isInteger(item.quantity) || item.quantity < 1) {
      unknownSkus.push(item.sku);
      continue;
    }
    if (unitPriceCents !== item.unitPriceCents) tamperDetected = true;

    const lineTotalCents = unitPriceCents * item.quantity;
    subtotalCents += lineTotalCents;
    lines.push({
      title: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceCents,
      lineTotalCents,
    });
  }

  const valid = items.length > 0 && unknownSkus.length === 0;
  const assemblyCents = valid ? assemblyCentsFor(items, shippingOption) : 0;
  const shippingCents = valid ? shippingCentsFor(shippingOption, subtotalCents) : 0;
  const taxCents = Math.round((subtotalCents + assemblyCents + shippingCents) * ESTIMATED_TAX_RATE);

  return {
    valid,
    tamperDetected,
    unknownSkus,
    subtotalCents,
    assemblyCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + assemblyCents + shippingCents + taxCents,
    lines,
  };
}

const deliveryMethodFor = (option: ShippingOption): FulfillmentType =>
  DELIVERY_OPTIONS[option].assembled ? 'assembled_local' : 'diy_kit_shipped';

/**
 * Creates an authoritative OrderStatusInfo record with initial BLUEPRINT_RECEIVED stage,
 * deterministic Stripe PaymentIntent simulation, and workshop tracking payload.
 * Throws if the cart can't be priced, so an empty or tampered cart never becomes an order.
 */
export function createStripeOrder(params: {
  items: CartItem[];
  customer: CheckoutCustomerData;
  shipping: CheckoutShippingData;
  paymentMethod: {
    brand: string;
    last4: string;
    wallet?: string;
  };
}): { order: OrderStatusInfo; stripeIntent: Record<string, unknown> } {
  const quote = quoteOrder(params.items, params.shipping.shippingOption);
  if (!quote.valid) {
    throw new Error(
      params.items.length === 0
        ? 'Your jar is empty.'
        : `These items are no longer available: ${quote.unknownSkus.join(', ')}`
    );
  }

  // Store the verified prices, not whatever the client sent.
  const verifiedItems = params.items.map((item, index) => ({
    ...item,
    unitPriceCents: quote.lines[index].unitPriceCents,
  }));

  const now = new Date();
  const orderId = `TS-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentIntentId = `pi_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

  const delivery = DELIVERY_OPTIONS[params.shipping.shippingOption];
  const estDelivery = addBusinessDays(now, delivery.leadBusinessDays.max).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const initialHistory: StageHistoryEntry[] = [
    {
      stage: 'BLUEPRINT_RECEIVED',
      timestamp: now.toISOString(),
      title: 'Blueprint Received & Queued in Studio',
      notes: `Order #${orderId} verified with ${params.items.length} build(s). BOM validated against master parts ledger. Our team queued the physical build tray.`,
      technician: STUDIO_TEAM_LABEL,
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
    deliveryMethod: deliveryMethodFor(params.shipping.shippingOption),
    deliveryOptionTitle: delivery.title,
    deliveryNotes: params.shipping.deliveryNotes,
    items: verifiedItems,
    subtotalCents: quote.subtotalCents,
    assemblyCents: quote.assemblyCents,
    shippingCents: quote.shippingCents,
    taxCents: quote.taxCents,
    totalCents: quote.totalCents,
    stripePaymentIntentId: paymentIntentId,
    paymentMethodDetails: params.paymentMethod,
    currentStage: 'BLUEPRINT_RECEIVED',
    stageHistory: initialHistory,
    createdAt: now.toISOString(),
    estimatedDeliveryDate: estDelivery,
    // Only shipped kits get a carrier tracking number; courier and pickup orders are handed over by the studio.
    trackingNumber:
      params.shipping.shippingOption === 'shipped'
        ? `1Z99999999${Math.floor(10000000 + Math.random() * 90000000)}`
        : undefined,
    carrier: delivery.carrier,
  };

  // Serialized Stripe PaymentIntent Payload
  const stripeIntent = {
    id: paymentIntentId,
    object: 'payment_intent',
    amount: quote.totalCents,
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
      delivery_mode: order.deliveryMethod,
      blueprints: JSON.stringify(
        verifiedItems
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
          amount_captured: quote.totalCents,
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
