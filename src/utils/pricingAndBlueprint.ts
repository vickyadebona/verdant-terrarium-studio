import type {
  BomSummary,
  FulfillmentType,
  HardwareId,
  PlacedItem,
  SerializedBlueprint,
  SubstrateLayer,
  VesselConfig,
} from '../types/terrarium';
import { CATALOG_ITEMS, HARDWARE_MODULES, SUBSTRATES } from '../data';

/**
 * Computes the live Bill-of-Materials (BOM) breakdown for the current terrarium build.
 */
export function calculateBomSummary(
  currentVessel: VesselConfig,
  substrates: SubstrateLayer[],
  items: PlacedItem[],
  equippedHardware: HardwareId[],
  fulfillmentType: FulfillmentType
): BomSummary {
  const vesselCost = currentVessel.price;
  const substrateCost = substrates.reduce((sum, layer) => {
    const cfg = SUBSTRATES.find((s) => s.id === layer.type);
    return sum + (cfg ? cfg.pricePerLayer : 5);
  }, 0);
  const itemsCost = items.reduce((sum, placed) => {
    const cat = CATALOG_ITEMS.find((c) => c.id === placed.itemId);
    return sum + (cat ? cat.price : 10);
  }, 0);
  const hardwareCost = equippedHardware.reduce((sum, hwId) => {
    const hw = HARDWARE_MODULES.find((h) => h.id === hwId);
    return sum + (hw ? hw.price : 0);
  }, 0);

  const assemblyFee = fulfillmentType === 'assembled_local' ? 25 : 0;
  const total = vesselCost + substrateCost + itemsCost + hardwareCost + assemblyFee;

  return {
    vesselCost,
    substrateCost,
    itemsCost,
    hardwareCost,
    assemblyFee,
    total,
  };
}

/**
 * Serializes the active terrarium configuration into a deterministic JSON Blueprint
 * suitable for workshop assembly instructions, PostgreSQL storage, and Stripe Checkout metadata.
 */
export function serializeBlueprint(
  currentVessel: VesselConfig,
  equippedHardware: HardwareId[],
  substrates: SubstrateLayer[],
  items: PlacedItem[],
  fulfillmentType: FulfillmentType,
  estimatedTotalUSD: number
): SerializedBlueprint {
  return {
    blueprintVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    fulfillmentType,
    estimatedTotalUSD,
    vessel: {
      id: currentVessel.id,
      sku: currentVessel.sku,
      name: currentVessel.name,
      price: currentVessel.price,
    },
    hardwareModules: equippedHardware.map((id) => {
      const hw = HARDWARE_MODULES.find((h) => h.id === id)!;
      return { id: hw.id, sku: hw.sku, name: hw.name, price: hw.price };
    }),
    substrateStackBottomToTop: substrates.map((s, idx) => {
      const cfg = SUBSTRATES.find((sub) => sub.id === s.type)!;
      return {
        layerOrder: idx + 1,
        sku: cfg.sku,
        name: cfg.name,
        depthMm: s.depth,
        slopeWave: s.contour,
        price: cfg.pricePerLayer,
      };
    }),
    specimens: items.map((i) => {
      const cat = CATALOG_ITEMS.find((c) => c.id === i.itemId)!;
      return {
        sku: cat.sku,
        name: cat.name,
        coordinates: { x: i.x, y: i.y },
        scale: i.scale,
        rotationDeg: i.rotation,
        flippedHorizontally: i.flipX,
        zIndex: i.zIndex,
        price: cat.price,
      };
    }),
  };
}
