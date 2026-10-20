import type React from 'react';

export type VesselId = 'globe' | 'wardian' | 'apothecary' | 'cloche' | 'teardrop' | 'flask';
export type SubstrateId = 'gravel' | 'leca' | 'charcoal' | 'humus' | 'sand' | 'moss';
export type HardwareId = 'circadian_led' | 'ultrasonic_mist' | 'hygro_controller' | 'copper_fairy';
export type ItemCategory = 'flora' | 'hardscape';
export type LightingMode = 'day' | 'golden' | 'night';
export type ActiveTab = 'vessels' | 'substrates' | 'flora' | 'hardscape' | 'hardware';
export type FulfillmentType = 'assembled_local' | 'diy_kit_shipped';

export interface VesselConfig {
  id: VesselId;
  sku: string;
  name: string;
  subtitle: string;
  price: number;
  clipPath: string;
  outlinePath: string;
  highlightPath: string;
  lidElement?: React.ReactNode;
  baseElement?: React.ReactNode;
}

export interface SubstrateConfig {
  id: SubstrateId;
  sku: string;
  name: string;
  role: string;
  pricePerLayer: number;
  colorTop: string;
  colorBottom: string;
  accentColor: string;
  patternType: 'pebbles' | 'spheres' | 'specks' | 'fibers' | 'fine' | 'moss';
}

export interface SubstrateLayer {
  uid: string;
  type: SubstrateId;
  depth: number; // 15 to 90
  contour: number; // -25 to 25
}

export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  latin: string;
  category: ItemCategory;
  price: number;
  bioluminescent?: boolean;
  defaultScale: number;
  renderSvg: (isNight: boolean) => React.ReactNode;
}

export interface HardwareModule {
  id: HardwareId;
  sku: string;
  name: string;
  specs: string;
  description: string;
  price: number;
  powerDraw: string;
}

export interface PlacedItem {
  uid: string;
  itemId: string;
  x: number; // SVG coordinate 50 to 350
  y: number; // SVG coordinate 60 to 440
  scale: number;
  rotation: number;
  flipX: boolean;
  zIndex: number;
}

export interface EcosystemPreset {
  name: string;
  vessel: VesselId;
  lighting: LightingMode;
  hardware: HardwareId[];
  substrates: SubstrateLayer[];
  items: PlacedItem[];
}

export interface BomSummary {
  vesselCost: number;
  substrateCost: number;
  itemsCost: number;
  hardwareCost: number;
  assemblyFee: number;
  total: number;
}

export interface SerializedBlueprint {
  blueprintVersion: string;
  createdAt: string;
  fulfillmentType: FulfillmentType;
  estimatedTotalUSD: number;
  vessel: {
    id: VesselId;
    sku: string;
    name: string;
    price: number;
  };
  hardwareModules: Array<{
    id: HardwareId;
    sku: string;
    name: string;
    price: number;
  }>;
  substrateStackBottomToTop: Array<{
    layerOrder: number;
    sku: string;
    name: string;
    depthMm: number;
    slopeWave: number;
    price: number;
  }>;
  specimens: Array<{
    sku: string;
    name: string;
    coordinates: { x: number; y: number };
    scale: number;
    rotationDeg: number;
    flippedHorizontally: boolean;
    zIndex: number;
    price: number;
  }>;
}

export type CartItemType = 'custom_blueprint' | 'signature_build' | 'hardware' | 'accessory';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  fulfillmentType?: FulfillmentType;
  blueprint?: SerializedBlueprint;
  vesselId?: VesselId;
  thumbnailSvg?: string;
  description?: string;
  hardwareIds?: HardwareId[];
  botanicalCount?: number;
  substrateCount?: number;
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
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
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
