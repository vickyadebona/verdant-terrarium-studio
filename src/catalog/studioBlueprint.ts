import type { BlueprintLine, SerializedBlueprint } from '../types/terrarium';
import {
  STUDIO_CATEGORIES,
  STUDIO_REQUIRED_CATEGORIES,
  SOIL_CONTOUR_RANGE,
  SOIL_DEPTH_RANGE_MM,
  STUDIO_OPTIONS,
  type SoilLayerSpec,
  type StudioCategory,
  type StudioOption,
} from './index';

export type StudioBlueprintResult =
  | { ok: true; blueprint: SerializedBlueprint }
  | { ok: false; missing: StudioCategory[] };

const clamp = (value: number, range: { min: number; max: number }) =>
  Math.min(range.max, Math.max(range.min, Math.round(value)));

function toLine(option: StudioOption, quantity: number): BlueprintLine {
  return { sku: option.sku, name: option.name, quantity, unitPriceCents: option.priceCents };
}

/**
 * Turns Studio state (option ids, repeated once per unit, plus soil layers)
 * into a blueprint. Fails with the missing steps when any required step
 * (STUDIO_REQUIRED_CATEGORIES) has no selection.
 */
export function buildStudioBlueprint(
  selectedIds: string[],
  soilLayers: SoilLayerSpec[],
  now: Date = new Date()
): StudioBlueprintResult {
  const counts = new Map<string, number>();
  for (const id of selectedIds) counts.set(id, (counts.get(id) ?? 0) + 1);

  const chosen = STUDIO_OPTIONS.filter((option) => counts.has(option.id));
  const vessel = chosen.find((option) => option.category === 'Vessel');
  const foundation = chosen.find((option) => option.category === 'Foundation');

  const missing = STUDIO_REQUIRED_CATEGORIES.filter(
    (category) => !chosen.some((option) => option.category === category)
  );
  if (missing.length > 0 || !vessel || !foundation) return { ok: false, missing };

  return {
    ok: true,
    blueprint: {
      blueprintVersion: 2,
      createdAt: now.toISOString(),
      vessel: toLine(vessel, 1),
      foundation: {
        ...toLine(foundation, 1),
        layers: soilLayers.map((layer, index) => ({
          layerOrder: index + 1,
          sku: layer.sku,
          name: layer.name,
          depthMm: clamp(layer.depthMm, SOIL_DEPTH_RANGE_MM),
          contour: clamp(layer.contour, SOIL_CONTOUR_RANGE),
        })),
      },
      elements: chosen
        .filter((option) => option.category === 'Flora' || option.category === 'Details')
        .map((option) => toLine(option, counts.get(option.id) ?? 1)),
    },
  };
}

/** True when the step has a selection, or doesn't require one. */
export function isStudioStepComplete(category: StudioCategory, selected: string[]): boolean {
  return (
    !STUDIO_REQUIRED_CATEGORIES.includes(category) ||
    selected.some((id) => STUDIO_OPTIONS.find((option) => option.id === id)?.category === category)
  );
}

/** The furthest step the shopper may open: the first required step that is still empty. */
export function furthestReachableStep(selected: string[]): StudioCategory {
  return STUDIO_CATEGORIES.find((category) => !isStudioStepComplete(category, selected)) ?? STUDIO_CATEGORIES[STUDIO_CATEGORIES.length - 1];
}
