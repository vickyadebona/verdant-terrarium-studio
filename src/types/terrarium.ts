/** How an order's builds are fulfilled, derived from its delivery choice. */
export type FulfillmentType = 'assembled_local' | 'diy_kit_shipped';

/** One priced line inside a blueprint. Prices are integer cents. */
export interface BlueprintLine {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface BlueprintSoilLayer {
  layerOrder: number; // 1 = bottom of the jar
  sku: string;
  name: string;
  depthMm: number;
  contour: number;
}

/** The Studio design the workshop builds from. */
export interface SerializedBlueprint {
  blueprintVersion: 2;
  createdAt: string;
  vessel: BlueprintLine;
  foundation: BlueprintLine & { layers: BlueprintSoilLayer[] };
  /** Flora and hardscape details, in Studio order. */
  elements: BlueprintLine[];
}

export type CartItemType = 'custom_blueprint' | 'signature_build' | 'hardware';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  blueprint?: SerializedBlueprint;
  description?: string;
}

export type OrderStage =
  | 'BLUEPRINT_RECEIVED'
  | 'CIRCUIT_SOLDERING'
  | 'PLANTING'
  | 'QUARANTINE'
  | 'SHIPPED';

export interface StageHistoryEntry {
  stage: OrderStage;
  timestamp: string;
  title: string;
  notes: string;
  technician: string;
}

export interface OrderStatusInfo {
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryMethod: FulfillmentType;
  deliveryOptionTitle: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotalCents: number;
  /** Missing on orders saved before assembly became an order-level line. */
  assemblyCents?: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  stripePaymentIntentId: string;
  paymentMethodDetails: {
    brand: string;
    last4: string;
    wallet?: string;
  };
  currentStage: OrderStage;
  stageHistory: StageHistoryEntry[];
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  estimatedDeliveryDate: string;
}
