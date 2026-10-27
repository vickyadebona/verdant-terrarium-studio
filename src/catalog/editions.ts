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
    vessel: "Tall Apothecary Jar · 14 in",
    vesselNote: "Smooth matte-white collar lid with integrated circadian LED, fan & ultrasonic fogger",
    overview:
      "Inspired by high-altitude Pacific coastal ravines where ocean fog gathers in sheltered tree canopies. The Cloud Forest balances vertical cascading foliage against sculpted ground mounds, creating a self-regulating water cycle under hand-blown glass.",
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
        light: "Full-Spectrum 5000K LED",
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
          "Circadian PWM grow LED, whisper-quiet micro ventilation fan, and 113kHz ultrasonic piezo fogger built directly into the matte-white lid ($0 / included).",
      },
    ],
    care: [
      {
        label: "Circadian Light",
        schedule: "8–10h Daily Cycle",
        detail:
          "Built-in full-spectrum Halo LED provides optimal PAR light without producing excess heat. No direct window sun needed.",
      },
      {
        label: "Ultrasonic Mist",
        schedule: "2–3 Times Weekly",
        detail:
          "Cycle the built-in fogger for 3–5 minutes whenever the glass appears dry or frond tips need refreshment.",
      },
      {
        label: "Distilled Water",
        schedule: "Monthly Reservoir Top-Up",
        detail:
          "Refill the concealed top hatch with 2–3 oz of distilled or reverse-osmosis water to keep ultrasonic misting discs mineral-free.",
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
    vessel: "Tall Apothecary Jar · 14 in",
    vesselNote: "Smooth matte-white collar lid with integrated circadian LED, fan & ultrasonic fogger",
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
        light: "Warm 4000K–5000K LED",
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
          "Circadian PWM grow LED, whisper-quiet micro ventilation fan, and 113kHz ultrasonic piezo fogger built directly into the matte-white lid ($0 / included).",
      },
    ],
    care: [
      {
        label: "Circadian Light",
        schedule: "8–10h Daily Cycle",
        detail:
          "The under-lid LED illuminates the venation of the Fittonia and gives ferns steady, reliable daylight.",
      },
      {
        label: "Ultrasonic Mist",
        schedule: "Every 2–3 Days",
        detail:
          "Run the fogger for 5 minutes. The porous volcanic rock absorbs ambient mist and gradually releases it throughout the day.",
      },
      {
        label: "Distilled Water",
        schedule: "Monthly Top-Up",
        detail:
          "Always use distilled water to prevent white calcium mineral scale from accumulating on the dark volcanic stone.",
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
    vessel: "Tall Fluted Apothecary Jar · 14 in",
    vesselNote: "Helical ridged matte-white collar lid with integrated circadian LED, fan & ultrasonic fogger",
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
        light: "Soft 5000K Diffused Glow",
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
          "Custom-molded matte-white lid featuring architectural diagonal fluting and concealed USB-A power routing.",
      },
      {
        name: "Integrated Smart Lid System",
        category: "Hardware Engine",
        description:
          "Circadian PWM grow LED, whisper-quiet micro ventilation fan, and 113kHz ultrasonic piezo fogger built directly into the matte-white lid ($0 / included).",
      },
    ],
    care: [
      {
        label: "Circadian Light",
        schedule: "6–8h Daily Cycle",
        detail:
          "Moss prefers gentle, cooler light. The built-in LED provides the ideal spectrum without drying out the domes.",
      },
      {
        label: "Ultrasonic Mist",
        schedule: "Once or Twice Weekly",
        detail:
          "A brief 3-minute mist cycle is all that is required. Dew settles gently across the cushion tops.",
      },
      {
        label: "Distilled Water",
        schedule: "Every 4–6 Weeks",
        detail:
          "Because closed moss recycling is so efficient, reservoir refills are needed only once every month or two.",
      },
      {
        label: "Condensation Check",
        schedule: "Self-Regulating",
        detail:
          "Light morning fog on the glass is normal and healthy. The built-in micro fan gently circulates air to maintain clarity.",
      },
    ],
  },
};

export function getEdition(id: string): StudioEdition | undefined {
  return (STUDIO_EDITIONS as Record<string, StudioEdition>)[id];
}
