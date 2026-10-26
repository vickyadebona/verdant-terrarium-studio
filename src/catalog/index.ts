import type { EditionKey } from '../utils/router';

// The single source of truth for everything TerraScape sells. The Studio, the
// cart, edition pages and the checkout pricing engine all read from here.

export type ProductKind =
  | 'vessel'
  | 'foundation'
  | 'flora'
  | 'hardscape'
  | 'hardware'
  | 'edition';

export interface Product {
  sku: string;
  name: string;
  kind: ProductKind;
  priceCents: number;
}

export type StudioCategory = 'Vessel' | 'Foundation' | 'Flora' | 'Details';

export const STUDIO_CATEGORIES: StudioCategory[] = ['Vessel', 'Foundation', 'Flora', 'Details'];

export const SINGLE_CHOICE_CATEGORIES: StudioCategory[] = ['Vessel', 'Foundation'];

/** Most of one Studio element a customer can add to a single build. */
export const MAX_ELEMENT_QUANTITY = 5;

const KIND_BY_CATEGORY: Record<StudioCategory, ProductKind> = {
  Vessel: 'vessel',
  Foundation: 'foundation',
  Flora: 'flora',
  Details: 'hardscape',
};

export interface StudioOption extends Product {
  /** Stable id used in Studio state, session storage and the 2D preview. */
  id: string;
  note: string;
  category: StudioCategory;
}

function studioOption(option: Omit<StudioOption, 'kind'>): StudioOption {
  return { ...option, kind: KIND_BY_CATEGORY[option.category] };
}

export const STUDIO_OPTIONS: StudioOption[] = [
  // STEP 01: VESSEL & LID
  studioOption({
    id: 'jar_smooth',
    sku: 'VSL-CIR-SM',
    name: 'Tall Apothecary Jar · Smooth Lid',
    note: 'Hand-blown circular glass · Integrated LED, fan & ultrasonic mist lid · 14 in',
    priceCents: 8400,
    category: 'Vessel',
  }),
  studioOption({
    id: 'jar_ridged',
    sku: 'VSL-CIR-RG',
    name: 'Tall Apothecary Jar · Ridged Lid',
    note: 'Hand-blown circular glass · Fluted collar with integrated LED, fan & mist · 14 in',
    priceCents: 9200,
    category: 'Vessel',
  }),

  // STEP 02: FOUNDATION
  studioOption({
    id: 'forest',
    sku: 'FND-FOR',
    name: 'Pacific Forest Floor',
    note: 'Biochar, coco coir, Douglas fir bark & contoured moss',
    priceCents: 2200,
    category: 'Foundation',
  }),
  studioOption({
    id: 'volcanic',
    sku: 'FND-VOL',
    name: 'Volcanic Lava-Rock Backwall',
    note: 'Stacked natural black scoria wall & five-layer drainage base',
    priceCents: 3400,
    category: 'Foundation',
  }),
  studioOption({
    id: 'tropical',
    sku: 'FND-TRP',
    name: 'Cloud Tropical Blend',
    note: 'Moisture-loving sphagnum, white silica sand ribbon & clay pebbles',
    priceCents: 2600,
    category: 'Foundation',
  }),

  // STEP 03: FLORA
  studioOption({
    id: 'fern',
    sku: 'FLR-FRN',
    name: 'Button Fern',
    note: 'Soft, arching emerald fronds',
    priceCents: 1800,
    category: 'Flora',
  }),
  studioOption({
    id: 'fittonia',
    sku: 'FLR-FIT',
    name: 'Fittonia Trio',
    note: 'Blush, white & ruby veined leaves',
    priceCents: 2400,
    category: 'Flora',
  }),
  studioOption({
    id: 'moss',
    sku: 'FLR-MOS',
    name: 'Cushion Moss',
    note: 'Cloud-like living carpet',
    priceCents: 1600,
    category: 'Flora',
  }),
  studioOption({
    id: 'monstera',
    sku: 'FLR-MON',
    name: 'Miniature Epiphyte Vine',
    note: 'Trailing tropical foliage along the upper scape',
    priceCents: 2200,
    category: 'Flora',
  }),
  studioOption({
    id: 'selaginella',
    sku: 'FLR-SEL',
    name: 'Selaginella Clubmoss',
    note: 'Delicate, feathery woodland groundcover',
    priceCents: 1500,
    category: 'Flora',
  }),

  // STEP 04: DETAILS
  studioOption({
    id: 'wood',
    sku: 'HRD-MOP',
    name: 'Mopani Branch',
    note: 'Sculptural weathered hardwood',
    priceCents: 1600,
    category: 'Details',
  }),
  studioOption({
    id: 'stone',
    sku: 'HRD-RIV',
    name: 'River Stone',
    note: 'Hand-selected smooth natural stone',
    priceCents: 1100,
    category: 'Details',
  }),
  studioOption({
    id: 'lava_rock',
    sku: 'HRD-LAV',
    name: 'Volcanic Accent Stones',
    note: 'Porous dark stones for natural texture',
    priceCents: 1400,
    category: 'Details',
  }),
];

export interface SoilLayerSpec {
  id: string;
  sku: string;
  name: string;
  role: string;
  depthMm: number;
  contour: number;
  colorTop: string;
  colorBottom: string;
  accentColor: string;
}

/** Soil layer depth range the Studio sliders allow, in millimetres. */
export const SOIL_DEPTH_RANGE_MM = { min: 12, max: 48 } as const;
export const SOIL_CONTOUR_RANGE = { min: -14, max: 14 } as const;

// Layers are included in the foundation price; they carry SKUs so the
// workshop knows exactly what to pour.
export const SOIL_RECIPES: Record<string, SoilLayerSpec[]> = {
  forest: [
    { id: 'leca', sku: 'SUB-LEC', name: 'River Gravel & Clay', role: 'Drainage Foundation', depthMm: 22, contour: 2, colorTop: '#7A6A5E', colorBottom: '#574B42', accentColor: '#9E8D80' },
    { id: 'charcoal', sku: 'SUB-CHR', name: 'Activated Biochar', role: 'Natural Filtration', depthMm: 14, contour: -4, colorTop: '#27272A', colorBottom: '#18181B', accentColor: '#52525B' },
    { id: 'humus', sku: 'SUB-HUM', name: 'Woodland Soil Blend', role: 'Nutrient-Rich Earth', depthMm: 38, contour: 10, colorTop: '#452B1D', colorBottom: '#2D1B11', accentColor: '#6B432E' },
    { id: 'moss_base', sku: 'SUB-MOS', name: 'Living Moss Base', role: 'Moisture Blanket', depthMm: 24, contour: -8, colorTop: '#5B7844', colorBottom: '#3E542D', accentColor: '#80A165' },
  ],
  volcanic: [
    { id: 'leca', sku: 'SUB-LEC', name: 'Expanded Clay Pebbles', role: 'Drainage Reservoir', depthMm: 26, contour: 4, colorTop: '#7C4D34', colorBottom: '#5A3724', accentColor: '#A66A4B' },
    { id: 'charcoal', sku: 'SUB-CHR', name: 'Activated Biochar', role: 'Water Purification', depthMm: 16, contour: -3, colorTop: '#27272A', colorBottom: '#18181B', accentColor: '#52525B' },
    { id: 'humus', sku: 'SUB-HUM', name: 'Tropical Bark & Humus', role: 'Root Foundation', depthMm: 34, contour: 8, colorTop: '#4A3223', colorBottom: '#332116', accentColor: '#6B4832' },
    { id: 'moss_base', sku: 'SUB-MOS', name: 'Cushion Moss Carpet', role: 'Living Floor', depthMm: 22, contour: -6, colorTop: '#527344', colorBottom: '#3B5430', accentColor: '#789E65' },
  ],
  tropical: [
    { id: 'leca', sku: 'SUB-LEC', name: 'Expanded Clay Pebbles', role: 'Moisture Reservoir', depthMm: 24, contour: 3, colorTop: '#855236', colorBottom: '#5E3924', accentColor: '#B0704D' },
    { id: 'sand', sku: 'SUB-SND', name: 'Silica Quartz Ribbon', role: 'Sculpted Horizon', depthMm: 16, contour: 11, colorTop: '#DFD3C3', colorBottom: '#C7B7A3', accentColor: '#F4EFE6' },
    { id: 'charcoal', sku: 'SUB-CHR', name: 'Activated Biochar', role: 'Freshness Layer', depthMm: 14, contour: -5, colorTop: '#27272A', colorBottom: '#18181B', accentColor: '#52525B' },
    { id: 'humus', sku: 'SUB-HUM', name: 'Sphagnum & Coir Blend', role: 'Tropical Substrate', depthMm: 32, contour: 6, colorTop: '#4E3424', colorBottom: '#362217', accentColor: '#755039' },
    { id: 'moss_base', sku: 'SUB-MOS', name: 'Live Cushion Moss', role: 'Soft Canopy Floor', depthMm: 20, contour: -7, colorTop: '#4F7542', colorBottom: '#37522D', accentColor: '#729E62' },
  ],
};

export const EDITION_PRODUCTS: Record<EditionKey, Product> = {
  cloud_forest: { sku: 'EDT-CLOUD_FOREST', name: 'The Cloud Forest', kind: 'edition', priceCents: 14600 },
  fern_study: { sku: 'EDT-FERN_STUDY', name: 'Fern Study', kind: 'edition', priceCents: 16200 },
  moss_garden: { sku: 'EDT-MOSS_GARDEN', name: 'Moss Garden', kind: 'edition', priceCents: 13800 },
};

export const ACCESSORY_PRODUCTS = {
  copperMicroLeds: {
    sku: 'HW-LGT-CPR3',
    name: 'Submersible Warm Copper Micro-LEDs',
    kind: 'hardware',
    priceCents: 1800,
  },
} satisfies Record<string, Product>;

/** Hand-planting and soldering in the LA studio, per custom build. */
export const ASSEMBLY_FEE_CENTS = 2500;
export const COURIER_FEE_CENTS = 1800;
export const SHIPPED_FEE_CENTS = 1800;
export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
/** Estimated CA sales tax until Stripe Tax computes it server-side. */
export const ESTIMATED_TAX_RATE = 0.095;

/** Days after delivery that the Living Arrival Guarantee covers a damaged vessel or plant. */
export const ARRIVAL_GUARANTEE_DAYS = 30;
/** Interest-free payments offered through Klarna / Affirm at checkout. */
export const INSTALLMENT_COUNT = 4;

const PRODUCTS_BY_SKU = new Map<string, Product>(
  [...STUDIO_OPTIONS, ...Object.values(EDITION_PRODUCTS), ...Object.values(ACCESSORY_PRODUCTS)].map(
    (product) => [product.sku, product]
  )
);

export function getProduct(sku: string): Product | undefined {
  return PRODUCTS_BY_SKU.get(sku);
}

export function getStudioOption(id: string): StudioOption | undefined {
  return STUDIO_OPTIONS.find((option) => option.id === id);
}

/**
 * Cheapest complete Studio design: the least expensive vessel and foundation, before
 * assembly and delivery. This is the "From" price on the collections page.
 */
export function studioStartingPriceCents(): number {
  return SINGLE_CHOICE_CATEGORIES.reduce((sum, category) => {
    const prices = STUDIO_OPTIONS.filter((option) => option.category === category).map(
      (option) => option.priceCents
    );
    return sum + Math.min(...prices);
  }, 0);
}
