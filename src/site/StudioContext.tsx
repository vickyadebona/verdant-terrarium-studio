"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_VESSEL_ID,
  MAX_ELEMENT_QUANTITY,
  STUDIO_CATEGORIES,
  SOIL_RECIPES,
  STUDIO_OPTIONS,
  type SoilLayerSpec,
  type StudioCategory,
  type StudioOption,
} from "../catalog";
import { SIGNATURE_PRESETS } from "../catalog/editions";
import { buildStudioBlueprint, furthestReachableStep } from "../catalog/studioBlueprint";
import { useCart } from "../context/CartContext";
import { useAppNavigate } from "./navigation";
import { ADD_TO_JAR_PROMPT, useSignedInAction } from "./useSignedInAction";

const BUILDER_SELECTED_STORAGE = "terrascape_builder_selected_v1";
const BUILDER_SOIL_STORAGE = "terrascape_builder_soil_v1";
const BUILDER_CATEGORY_STORAGE = "terrascape_builder_category_v1";

export type ChosenOption = StudioOption & { quantity: number };

interface StudioContextValue {
  activeCategory: StudioCategory;
  setActiveCategory: (category: StudioCategory) => void;
  /** Selected option ids; repeated ids are quantities. */
  selected: string[];
  soilLayers: SoilLayerSpec[];
  setSoilLayers: (layers: SoilLayerSpec[]) => void;
  chosen: ChosenOption[];
  totalElements: number;
  subtotalCents: number;
  toggleOption: (option: StudioOption) => void;
  adjustOptionQuantity: (option: StudioOption, delta: number) => void;
  /** Loads an edition's recipe into the Studio and opens it. */
  loadSignaturePreset: (presetKey: string) => void;
  /**
   * Adds the current design to the jar, asking guests to sign in first. Returns the steps
   * still missing, if any (nothing is added then).
   */
  addStudioDesignToJar: () => StudioCategory[];
}

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

/** Every design has a vessel: fall back to the smooth lid when a saved design has none. */
function withDefaultVessel(selected: string[]): string[] {
  const hasVessel = selected.some((id) => STUDIO_OPTIONS.find((option) => option.id === id)?.category === "Vessel");
  return hasVessel ? selected : [DEFAULT_VESSEL_ID, ...selected];
}

function clampToFirstIncompleteStep(category: StudioCategory, selected: string[]): StudioCategory {
  const limit = STUDIO_CATEGORIES.indexOf(furthestReachableStep(selected));
  return STUDIO_CATEGORIES.indexOf(category) > limit ? STUDIO_CATEGORIES[limit] : category;
}

function readSession<T>(key: string, parse: (raw: string) => T | undefined): T | undefined {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? undefined : parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * The Studio design in progress. It lives above the pages so it survives moving between them,
 * and is kept in sessionStorage so a refresh doesn't lose it.
 */
export function StudioProvider({ children }: { children: ReactNode }) {
  const navigate = useAppNavigate();
  const { addCustomBlueprint } = useCart();
  const runSignedIn = useSignedInAction();

  // Start from defaults so the server render and first client render match; the saved design
  // is restored right after mount.
  const [activeCategory, setActiveCategory] = useState<StudioCategory>("Vessel");
  const [selected, setSelected] = useState<string[]>([DEFAULT_VESSEL_ID]);
  const [soilLayers, setSoilLayers] = useState<SoilLayerSpec[]>(SOIL_RECIPES.forest);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const savedSelected = readSession(BUILDER_SELECTED_STORAGE, (raw) => {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : undefined;
    });
    const savedSoil = readSession(BUILDER_SOIL_STORAGE, (raw) => {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as SoilLayerSpec[]) : undefined;
    });
    const savedCategory = readSession(BUILDER_CATEGORY_STORAGE, (raw) =>
      STUDIO_CATEGORIES.includes(raw as StudioCategory) ? (raw as StudioCategory) : undefined
    );
    const restoredSelected = withDefaultVessel(savedSelected ?? [DEFAULT_VESSEL_ID]);
    setSelected(restoredSelected);
    if (savedSoil) setSoilLayers(savedSoil);
    // Never reopen past a required step that is still empty.
    if (savedCategory) setActiveCategory(clampToFirstIncompleteStep(savedCategory, restoredSelected));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(BUILDER_SELECTED_STORAGE, JSON.stringify(selected));
      sessionStorage.setItem(BUILDER_SOIL_STORAGE, JSON.stringify(soilLayers));
      sessionStorage.setItem(BUILDER_CATEGORY_STORAGE, activeCategory);
    } catch {
      // Private mode or full storage: the design still works for this visit.
    }
  }, [restored, selected, soilLayers, activeCategory]);

  const chosen = useMemo<ChosenOption[]>(
    () =>
      STUDIO_OPTIONS.map((option) => ({
        ...option,
        quantity: selected.filter((id) => id === option.id).length,
      })).filter((item) => item.quantity > 0),
    [selected]
  );
  const totalElements = chosen.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = chosen.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const toggleOption = (option: StudioOption) => {
    if (option.category === "Foundation" && SOIL_RECIPES[option.id]) {
      setSoilLayers(SOIL_RECIPES[option.id].map((layer) => ({ ...layer })));
    }
    setSelected((current) => {
      const singleSelect = option.category === "Vessel" || option.category === "Foundation";
      if (singleSelect) {
        const withoutCategory = current.filter(
          (id) => STUDIO_OPTIONS.find((item) => item.id === id)?.category !== option.category
        );
        return [...withoutCategory, option.id];
      }
      return current.includes(option.id)
        ? current.filter((id) => id !== option.id)
        : [...current, option.id];
    });
  };

  const adjustOptionQuantity = (option: StudioOption, delta: number) => {
    setSelected((current) => {
      const currentCount = current.filter((id) => id === option.id).length;
      const nextCount = Math.max(0, Math.min(MAX_ELEMENT_QUANTITY, currentCount + delta));
      const withoutOption = current.filter((id) => id !== option.id);
      return [...withoutOption, ...Array<string>(nextCount).fill(option.id)];
    });
  };

  const loadSignaturePreset = (presetKey: string) => {
    const preset = SIGNATURE_PRESETS[presetKey];
    if (!preset) return;
    setSelected(preset.selected);
    setSoilLayers(SOIL_RECIPES[preset.recipeKey].map((layer) => ({ ...layer })));
    setActiveCategory("Vessel");
    navigate("/studio");
  };

  const addStudioDesignToJar = (): StudioCategory[] => {
    const result = buildStudioBlueprint(selected, soilLayers);
    if (!result.ok) return result.missing;
    // Guests design freely; saving to the jar needs an account.
    runSignedIn(() => addCustomBlueprint(result.blueprint), ADD_TO_JAR_PROMPT);
    return [];
  };

  return (
    <StudioContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        selected,
        soilLayers,
        setSoilLayers,
        chosen,
        totalElements,
        subtotalCents,
        toggleOption,
        adjustOptionQuantity,
        loadSignaturePreset,
        addStudioDesignToJar,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used within a StudioProvider");
  return context;
}
