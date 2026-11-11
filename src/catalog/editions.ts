import { EDITION_PRODUCTS } from './index';
import type { EditionKey } from '../utils/router';

// Studio editions and site photography. Plain data (no React), so server routes can use it
// for metadata and static params as well as the client pages.

export const images = {
  hero: "/renders/terrascape-hero-photo.jpg",
  collection: "https://images.unsplash.com/photo-1636406261400-dc146d8f3699?auto=format&fit=crop&w=1200&q=85",
  fern: "https://images.unsplash.com/photo-1756511946084-db06133ea4f0?auto=format&fit=crop&w=1000&q=85",
  moss: "https://images.unsplash.com/photo-1767131543385-1256db237a33?auto=format&fit=crop&w=1000&q=85",
  jar: "https://images.unsplash.com/photo-1738061422017-8b647262e703?auto=format&fit=crop&w=1000&q=85",
};

export const SIGNATURE_PRESETS: Record<
  string,
  {
    name: string;
    edition: string;
    selected: string[];
    recipeKey: "volcanic" | "forest" | "tropical";
  }
> = {
  cloud_forest: {
    name: "The Cloud Forest",
    edition: "Studio edition · 01",
    selected: ["jar_smooth", "forest", "fern", "moss", "stone"],
    recipeKey: "forest",
  },
  fern_study: {
    name: "Fern Study",
    edition: "Studio edition · 02",
    selected: ["jar_smooth", "volcanic", "fern", "fittonia", "lava_rock"],
    recipeKey: "volcanic",
  },
  moss_garden: {
    name: "Moss Garden",
    edition: "Studio edition · 03",
    selected: ["jar_ridged", "tropical", "moss", "selaginella", "stone"],
    recipeKey: "tropical",
  },
};

export interface EditionFloraItem {
  name: string;
  botanical: string;
  role: string;
  description: string;
  humidity: string;
  light: string;
}

export interface EditionElementItem {
  name: string;
  category: string;
  description: string;
}

export interface EditionCareItem {
  label: string;
  schedule: string;
  detail: string;
}

export interface StudioEdition {
  id: EditionKey;
  edition: string;
  name: string;
  tagline: string;
  sku: string;
  priceCents: number;
  image: string;
  vessel: string;
  vesselNote: string;
  overview: string;
  story: string;
  presetKey: EditionKey;
  flora: EditionFloraItem[];
  elements: EditionElementItem[];
  care: EditionCareItem[];
}

export const STUDIO_EDITIONS: Record<EditionKey, StudioEdition> = {
  cloud_forest: {
    id: "cloud_forest",
    edition: "Studio edition · 01",
    name: "The Cloud Forest",
    tagline: "A cascading temperate cloud-canopy with delicate button ferns and living moss mounds.",
    sku: EDITION_PRODUCTS.cloud_forest.sku,
    priceCents: EDITION_PRODUCTS.cloud_forest.priceCents,
    image: images.collection,
    vessel: "Tall Apothecary Jar",
    vesselNote: "Smooth matte-white collar lid with built-in warm light, fan & mister",
    overview:
      "Inspired by high-altitude Pacific coastal ravines where ocean fog gathers in sheltered tree canopies. The Cloud Forest balances vertical cascading foliage against sculpted ground mounds, creating a self-regulating water cycle under glass.",
    story:
      "Every Cloud Forest build is planted by hand in our Los Angeles greenhouse. We anchor a four-layer woodland substrate, tuck living cushion moss blankets around the stone contours, and seat our integrated smart lid so your terrarium begins its rain cycle the moment you plug it in.",
    presetKey: "cloud_forest",
    flora: [
      {
        name: "Button Fern",
        botanical: "Pellaea rotundifolia",
        role: "Primary Canopy Fronds",
        description:
          "Soft, arching dark-emerald fronds with leathery button-shaped pinnae that catch and channel morning mist.",
        humidity: "70% – 85% RH",
        light: "Warm 3000K LED",
      },
      {
        name: "Cushion Pillow Moss",
        botanical: "Leucobryum glaucum",
        role: "Living Forest Carpet",
        description:
          "Velvet-soft mounded bryophyte domes that act as a living botanical sponge, storing humidity and releasing it gradually.",
        humidity: "65% – 90% RH",
        light: "Soft Diffused Canopy Glow",
      },
      {
        name: "Miniature Epiphyte Vine",
        botanical: "Ficus pumila var. quercifolia",
        role: "Upper Glass & Stone Climber",
        description:
          "Tiny oak-shaped leaves that gracefully scale the rear glass wall and weathered river stones, adding vertical depth.",
        humidity: "60% – 85% RH",
        light: "Gentle Daylight LED",
      },
    ],
    elements: [
      {
        name: "Pacific Forest Earth Blend",
        category: "Stratified Foundation",
        description:
          "Four-stage substrate consisting of expanded clay drainage pebbles, activated filtration biochar, and nutrient-dense Douglas fir bark humus.",
      },
      {
        name: "Willamette River Stones",
        category: "Hardscape Specimen",
        description:
          "Hand-selected smooth, tumbled river stones that anchor soil contour waves and create natural mineral condensation pathways.",
      },
      {
        name: "Integrated Smart Lid System",
        category: "Hardware Engine",
        description:
          "A warm 3000K light with an on/off button, a quiet fan that keeps the glass clear, and a mister, all built into the lid ($0 / included).",
      },
    ],
    care: [
      {
        label: "Warm Light",
        schedule: "About 8–10 h a Day",
        detail:
          "The built-in 3000K warm white light switches on and off with one button. Turn it on in the morning and off at night; no direct window sun needed.",
      },
      {
        label: "Mister",
        schedule: "2–3 Times Weekly",
        detail:
          "Press the mister button once for about 30 seconds of mist whenever the moss looks dry or frond tips need refreshment.",
      },
      {
        label: "Distilled Water",
        schedule: "Check Before Misting",
        detail:
          "The mister holds about 2 oz of distilled or purified water. Never let it run dry: running the mister empty can damage it.",
      },
      {
        label: "Gentle Pruning",
        schedule: "Every 3–4 Months",
        detail:
          "If a fern frond nears the glass lid, trim cleanly at the stem base with small shears to encourage bushier canopy growth.",
      },
    ],
  },
  fern_study: {
    id: "fern_study",
    edition: "Studio edition · 02",
    name: "Fern Study",
    tagline: "Contrasting architectural fronds, ruby nerve venation, and dark volcanic rock walls.",
    sku: EDITION_PRODUCTS.fern_study.sku,
    priceCents: EDITION_PRODUCTS.fern_study.priceCents,
    image: images.fern,
    vessel: "Tall Apothecary Jar",
    vesselNote: "Smooth matte-white collar lid with built-in warm light, fan & mister",
    overview:
      "A rich botanical exploration of leaf geometry and geological contrast. The intense ruby and blush venation of Fittonia stands out dramatically against the deep black scoria of volcanic rock walls and arching button fern stems.",
    story:
      "We sculpt the volcanic rock backwall piece by piece, locking porous basalt stones together so epiphyte roots can weave securely through the crevices. The result is a dramatic shaded tropical grotto that thrives in indoor spaces.",
    presetKey: "fern_study",
    flora: [
      {
        name: "Fittonia Trio (Nerve Plant)",
        botanical: "Fittonia albivenis",
        role: "Focal Foliage Accent",
        description:
          "Striking ruby, blush, and white mosaic-veined leaves that serve as a natural living hygrometer—softening when dry and perking up when misted.",
        humidity: "75% – 90% RH",
        light: "Warm 3000K LED",
      },
      {
        name: "Button Fern",
        botanical: "Pellaea rotundifolia",
        role: "Structural Green Fronds",
        description:
          "Arching dark emerald fronds that rise above the volcanic rock face, providing dramatic height and organic texture.",
        humidity: "70% – 85% RH",
        light: "Full-Spectrum Canopy Light",
      },
      {
        name: "Cushion Moss",
        botanical: "Leucobryum glaucum",
        role: "Rock Crevice Base",
        description:
          "Compact emerald mounds nestled into the base of the lava rock wall to anchor root zones and stabilize humidity.",
        humidity: "70% – 90% RH",
        light: "Soft Diffused LED",
      },
    ],
    elements: [
      {
        name: "Volcanic Scoria Backwall",
        category: "Hardscape Specimen",
        description:
          "Stacked natural black volcanic scoria boulders with porous cellular pockets that naturally retain micro-droplets of water.",
      },
      {
        name: "Five-Layer Drainage Foundation",
        category: "Stratified Foundation",
        description:
          "Expanded clay base, biochar purification filter, and tropical bark humus blend engineered specifically for humidity-loving ferns.",
      },
      {
        name: "Integrated Smart Lid System",
        category: "Hardware Engine",
        description:
          "A warm 3000K light with an on/off button, a quiet fan that keeps the glass clear, and a mister, all built into the lid ($0 / included).",
      },
    ],
    care: [
      {
        label: "Warm Light",
        schedule: "About 8–10 h a Day",
        detail:
          "The warm 3000K light illuminates the venation of the Fittonia and gives ferns steady light. One button turns it on and off.",
      },
      {
        label: "Mister",
        schedule: "Every 2–3 Days",
        detail:
          "Press the mister button for about 30 seconds of mist; press again to add another 30. The porous volcanic rock absorbs the mist and gradually releases it throughout the day.",
      },
      {
        label: "Distilled Water",
        schedule: "Check Before Misting",
        detail:
          "Fill the 2 oz mister with distilled or purified water to prevent white mineral scale on the dark volcanic stone. Never let it run dry.",
      },
      {
        label: "Leaf Hydration",
        schedule: "Visual Observation",
        detail:
          "Observe the Fittonia leaves—if they look slightly relaxed, a quick misting cycle will have them standing tall within an hour.",
      },
    ],
  },
  moss_garden: {
    id: "moss_garden",
    edition: "Studio edition · 03",
    name: "Moss Garden",
    tagline: "A tranquil Japanese woodland Zen composition featuring ancient clubmoss and silica ribbons.",
    sku: EDITION_PRODUCTS.moss_garden.sku,
    priceCents: EDITION_PRODUCTS.moss_garden.priceCents,
    image: images.moss,
    vessel: "Tall Fluted Apothecary Jar",
    vesselNote: "Helical ridged matte-white collar lid with built-in warm light, fan & mister",
    overview:
      "A minimalist meditation on ancient non-vascular bryophytes. Contoured ribbons of fine white silica sand flow between velvety domes of cushion moss and feathery plumes of prehistoric Selaginella clubmoss beneath a fluted ridged collar.",
    story:
      "Moss is the oldest land plant on Earth, surviving for over 450 million years. In this sealed apothecary vessel, moss recycles its own moisture in an almost closed loop, creating an extraordinarily peaceful, low-maintenance living companion.",
    presetKey: "moss_garden",
    flora: [
      {
        name: "Cushion Moss",
        botanical: "Leucobryum glaucum",
        role: "Primary Zen Mounds",
        description:
          "Smooth, undulating domes of velvet-green moss that stay vivid year-round and absorb ambient mist directly through their leaves.",
        humidity: "75% – 95% RH",
        light: "Soft 3000K Warm Glow",
      },
      {
        name: "Selaginella Clubmoss",
        botanical: "Selaginella kraussiana",
        role: "Feathery Micro-Canopy",
        description:
          "Delicate, lace-like prehistoric foliage that arches above the moss pillows, resembling miniature ancient cedar trees.",
        humidity: "70% – 90% RH",
        light: "Gentle Daylight LED",
      },
      {
        name: "Living Root Fiber Barrier",
        botanical: "Sphagnum capillifolium",
        role: "Substrate Boundary",
        description:
          "Micro-woven moss root layer that prevents fine soils from shifting into the decorative silica quartz ribbon.",
        humidity: "80% – 95% RH",
        light: "Low Ambient Light",
      },
    ],
    elements: [
      {
        name: "Silica Quartz Ribbon",
        category: "Decorative Horizon",
        description:
          "A sculpted white quartz sand horizon that reflects LED light upward into the emerald canopy.",
      },
      {
        name: "Helical Ridged Apothecary Lid",
        category: "Vessel Collar",
        description:
          "Custom-molded matte-white lid featuring architectural diagonal fluting and a tidy white USB power cord.",
      },
      {
        name: "Integrated Smart Lid System",
        category: "Hardware Engine",
        description:
          "A warm 3000K light with an on/off button, a quiet fan that keeps the glass clear, and a mister, all built into the lid ($0 / included).",
      },
    ],
    care: [
      {
        label: "Warm Light",
        schedule: "About 6–8 h a Day",
        detail:
          "Moss prefers gentle light. Switch the warm 3000K light on for part of the day; it won't dry out the domes.",
      },
      {
        label: "Mister",
        schedule: "Once or Twice Weekly",
        detail:
          "One press of the mister (about 30 seconds) is all that is required. Dew settles gently across the cushion tops.",
      },
      {
        label: "Distilled Water",
        schedule: "Check Before Misting",
        detail:
          "Moss needs little extra water, so the 2 oz mister lasts a long time. Use distilled or purified water and never let it run dry.",
      },
      {
        label: "Condensation Check",
        schedule: "Self-Regulating",
        detail:
          "Light condensation on the glass is normal and healthy. Switch on the built-in fan to clear the glass so you can see the garden.",
      },
    ],
  },
};

export function getEdition(id: string): StudioEdition | undefined {
  return (STUDIO_EDITIONS as Record<string, StudioEdition>)[id];
}
