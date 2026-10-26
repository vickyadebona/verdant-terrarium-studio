import { useEffect, useMemo, useRef, useState } from "react";
import Terrarium3DShowcase from "./Terrarium3DShowcase";
import Terrarium2DLayeredView from "./Terrarium2DLayeredView";
import {
  ARRIVAL_GUARANTEE_DAYS,
  ASSEMBLY_FEE_CENTS,
  EDITION_PRODUCTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  MAX_ELEMENT_QUANTITY,
  SHIPPED_FEE_CENTS,
  SINGLE_CHOICE_CATEGORIES,
  SOIL_CONTOUR_RANGE,
  SOIL_DEPTH_RANGE_MM,
  SOIL_RECIPES,
  STUDIO_CATEGORIES,
  STUDIO_OPTIONS,
  getStudioOption,
  studioStartingPriceCents,
  type SoilLayerSpec,
  type StudioCategory,
  type StudioOption,
} from "./catalog";
import { formatCents } from "./catalog/money";
import { DELIVERY_OPTIONS, QUARANTINE_HOURS } from "./catalog/delivery";
import { buildStudioBlueprint } from "./catalog/studioBlueprint";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { CartDrawer } from "./components/CartDrawer";
import { StripeCheckoutModal } from "./components/StripeCheckoutModal";
import { OrderTrackerModal } from "./components/OrderTrackerModal";
import { AuthModal } from "./components/AuthModal";
import type { User as UserProfile } from "./types/auth";
import { EditionDetailPage } from "./components/EditionDetailPage";
import {
  parsePath,
  resolvePath,
  type RouteInfo,
  type Page,
  type EditionKey,
} from "./utils/router";

export type { Page, EditionKey };

type Category = StudioCategory;
type Option = StudioOption;

const images = {
  hero: "/renders/terrascape-hero-photo.jpg",
  collection: "https://images.unsplash.com/photo-1636406261400-dc146d8f3699?auto=format&fit=crop&w=1200&q=85",
  fern: "https://images.unsplash.com/photo-1756511946084-db06133ea4f0?auto=format&fit=crop&w=1000&q=85",
  moss: "https://images.unsplash.com/photo-1767131543385-1256db237a33?auto=format&fit=crop&w=1000&q=85",
  jar: "https://images.unsplash.com/photo-1738061422017-8b647262e703?auto=format&fit=crop&w=1000&q=85",
};

// Studio product photos, keyed by Studio option id.
const optionImages: Partial<Record<string, string>> = {
  fern: images.jar,
  fittonia: images.fern,
  moss: images.moss,
};

const options = STUDIO_OPTIONS;
const categories = STUDIO_CATEGORIES;

const SIGNATURE_PRESETS: Record<
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function LeafMark() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className="leaf-mark">
      <g transform="translate(11, 4.583333)" fill="currentColor" stroke="none">
        <path d="M1.375 0L1.375 0.6875L20.625 0.6875L20.625 0L20.625 -0.6875L1.375 -0.6875L1.375 0ZM20.625 0L20.625 0.6875C21.0047 0.6875 21.3125 0.995304 21.3125 1.375L22 1.375L22.6875 1.375C22.6875 0.235913 21.7641 -0.6875 20.625 -0.6875L20.625 0ZM22 1.375L21.3125 1.375L21.3125 3.20833L22 3.20833L22.6875 3.20833L22.6875 1.375L22 1.375ZM22 3.20833L21.3125 3.20833C21.3125 3.58803 21.0047 3.89583 20.625 3.89583L20.625 4.58333L20.625 5.27083C21.7641 5.27083 22.6875 4.34742 22.6875 3.20833L22 3.20833ZM20.625 4.58333L20.625 3.89583L1.375 3.89583L1.375 4.58333L1.375 5.27083L20.625 5.27083L20.625 4.58333ZM1.375 4.58333L1.375 3.89583C0.995304 3.89583 0.6875 3.58803 0.6875 3.20833L0 3.20833L-0.6875 3.20833C-0.6875 4.34742 0.235913 5.27083 1.375 5.27083L1.375 4.58333ZM0 3.20833L0.6875 3.20833L0.6875 1.375L0 1.375L-0.6875 1.375L-0.6875 3.20833L0 3.20833ZM0 1.375L0.6875 1.375C0.6875 0.995304 0.995304 0.6875 1.375 0.6875L1.375 0L1.375 -0.6875C0.235913 -0.6875 -0.6875 0.235913 -0.6875 1.375L0 1.375Z" />
      </g>
      <g transform="translate(16.5, 9.166666)" fill="currentColor" stroke="none">
        <path d="M0 3.20833L-0.6875 3.20833C-0.6875 3.58803 -0.379696 3.89583 0 3.89583L0 3.20833ZM11 3.20833L11 3.89583C11.3797 3.89583 11.6875 3.58803 11.6875 3.20833L11 3.20833ZM0 0L-0.6875 0L-0.6875 3.20833L0 3.20833L0.6875 3.20833L0.6875 0L0 0ZM0 3.20833L0 3.89583L11 3.89583L11 3.20833L11 2.52083L0 2.52083L0 3.20833ZM11 3.20833L11.6875 3.20833L11.6875 0L11 0L10.3125 0L10.3125 3.20833L11 3.20833Z" />
      </g>
      <g transform="translate(8.478672, 9.166666)" fill="currentColor" stroke="none">
        <path d="M2.88799 5.775L2.49373 5.21176L2.48929 5.21492L2.88799 5.775ZM0.745712 8.26177L1.35864 8.57317L1.35864 8.57317L0.745712 8.26177ZM0.000495019 11.4583L0.688044 11.4583L0.687946 11.4501L0.000495019 11.4583ZM27.0422 11.4583L26.3547 11.4501L26.3547 11.4583L27.0422 11.4583ZM26.2969 8.26177L25.684 8.57317L25.684 8.57318L26.2969 8.26177ZM24.1547 5.775L24.5534 5.2149L24.5488 5.21171L24.1547 5.775ZM22.688 2.97917L22.0005 2.97917L22.0005 2.98329L22.688 2.97917ZM4.35466 0L3.66716 0L3.66716 2.97917L4.35466 2.97917L5.04216 2.97917L5.04216 0L4.35466 0ZM4.35466 2.97917L3.66716 2.97917C3.66716 3.85227 3.22872 4.69729 2.49374 5.21178L2.88799 5.775L3.28225 6.33822C4.3806 5.56938 5.04216 4.30606 5.04216 2.97917L4.35466 2.97917ZM2.88799 5.775L2.48929 5.21492C1.49446 5.9231 0.685913 6.86166 0.132784 7.95036L0.745712 8.26177L1.35864 8.57317C1.8112 7.68242 2.47274 6.91451 3.2867 6.33508L2.88799 5.775ZM0.745712 8.26177L0.132784 7.95036C-0.420346 9.03906 -0.701608 10.2455 -0.686956 11.4666L0.000495019 11.4583L0.687946 11.4501C0.675957 10.451 0.90608 9.46393 1.35864 8.57317L0.745712 8.26177ZM0.000495019 11.4583L-0.687005 11.4583L-0.687005 22.4583L0.000495019 22.4583L0.687995 22.4583L0.687995 11.4583L0.000495019 11.4583ZM0.000495019 22.4583L-0.687005 22.4583C-0.687005 26.3672 2.5083 29.5625 6.41716 29.5625L6.41716 28.875L6.41716 28.1875C3.26769 28.1875 0.687995 25.6078 0.687995 22.4583L0.000495019 22.4583ZM6.41716 28.875L6.41716 29.5625L20.6255 29.5625L20.6255 28.875L20.6255 28.1875L6.41716 28.1875L6.41716 28.875ZM20.6255 28.875L20.6255 29.5625C24.5344 29.5625 27.7297 26.3672 27.7297 22.4583L27.0422 22.4583L26.3547 22.4583C26.3547 25.6078 23.775 28.1875 20.6255 28.1875L20.6255 28.875ZM27.0422 22.4583L27.7297 22.4583L27.7297 11.4583L27.0422 11.4583L26.3547 11.4583L26.3547 22.4583L27.0422 22.4583ZM27.0422 11.4583L27.7296 11.4666C27.7443 10.2455 27.463 9.03906 26.9099 7.95036L26.2969 8.26177L25.684 8.57318C26.1366 9.46393 26.3667 10.451 26.3547 11.4501L27.0422 11.4583ZM26.2969 8.26177L26.9099 7.95036C26.3567 6.86166 25.5482 5.9231 24.5534 5.21492L24.1547 5.775L23.756 6.33508C24.5699 6.91451 25.2315 7.68242 25.684 8.57317L26.2969 8.26177ZM24.1547 5.775L24.5488 5.21171C24.1888 4.95976 23.8943 4.6252 23.6902 4.23605L23.0814 4.55543L22.4725 4.8748C22.7788 5.45853 23.2204 5.96038 23.7605 6.33829L24.1547 5.775ZM23.0814 4.55543L23.6902 4.23605C23.486 3.84689 23.3781 3.41448 23.3755 2.97504L22.688 2.97917L22.0005 2.98329C22.0045 3.64246 22.1663 4.29107 22.4725 4.8748L23.0814 4.55543ZM22.688 2.97917L23.3755 2.97917L23.3755 0L22.688 0L22.0005 0L22.0005 2.97917L22.688 2.97917Z" />
      </g>
      <g transform="translate(8.479166, 25.36532)" fill="currentColor" stroke="none">
        <path d="M-0.19141 2.5075C-0.491769 2.73977 -0.54696 3.17156 -0.314682 3.47192C-0.0824043 3.77228 0.349384 3.82747 0.649743 3.59519L0.229167 3.05135L-0.19141 2.5075ZM10.5417 1.30968L10.2648 1.93896L10.2651 1.9391L10.5417 1.30968ZM19.0208 1.21801L19.3434 1.82515L19.3439 1.8249L19.0208 1.21801ZM26.7624 1.38792C27.1094 1.54213 27.5157 1.38587 27.6699 1.0389C27.8241 0.691928 27.6679 0.285642 27.3209 0.131433L27.0417 0.759679L26.7624 1.38792ZM0 6.94718C-0.379696 6.94718 -0.6875 7.25498 -0.6875 7.63468C-0.6875 8.01437 -0.379696 8.32218 0 8.32218L0 7.63468L0 6.94718ZM27.0417 8.32218C27.4214 8.32218 27.7292 8.01437 27.7292 7.63468C27.7292 7.25498 27.4214 6.94718 27.0417 6.94718L27.0417 7.63468L27.0417 8.32218ZM0.229167 3.05135L0.649743 3.59519C3.92872 1.05945 7.10147 0.547101 10.2648 1.93896L10.5417 1.30968L10.8186 0.6804C7.10686 -0.952742 3.40461 -0.273426 -0.19141 2.5075L0.229167 3.05135ZM10.5417 1.30968L10.2651 1.9391C11.8324 2.62775 13.3143 3.02791 14.8128 3.03415C16.3179 3.04042 17.7924 2.64912 19.3434 1.82515L19.0208 1.21801L18.6983 0.61087C17.3159 1.34524 16.0634 1.66435 14.8185 1.65916C13.567 1.65395 12.276 1.32077 10.8182 0.680259L10.5417 1.30968ZM19.0208 1.21801L19.3439 1.8249C22.0093 0.40622 24.4914 0.37857 26.7624 1.38792L27.0417 0.759679L27.3209 0.131433C24.6419 -1.05921 21.7157 -0.995196 18.6978 0.611124L19.0208 1.21801ZM0 7.63468L0 8.32218L27.0417 8.32218L27.0417 7.63468L27.0417 6.94718L0 6.94718L0 7.63468Z" />
      </g>
      <g transform="translate(21.760237, 19.708334)" fill="currentColor" stroke="none">
        <path d="M-0.791117 6.89929C-0.7777 7.34207 -0.407883 7.69013 0.0348923 7.67672C0.477667 7.6633 0.825731 7.29348 0.812313 6.85071L0.0105979 6.875L-0.791117 6.89929ZM2.14757 0.440486C2.39084 0.0702869 2.28795 -0.427032 1.91775 -0.670305C1.54755 -0.913579 1.05023 -0.810686 0.806959 -0.440486L1.47726 0L2.14757 0.440486ZM0.0105979 6.875L0.812313 6.85071C0.723298 3.91319 1.2187 1.85399 2.14757 0.440486L1.47726 0L0.806959 -0.440486C-0.372501 1.35434 -0.885435 3.78681 -0.791117 6.89929L0.0105979 6.875Z" />
      </g>
      <g transform="translate(16.545832, 19.475)" fill="currentColor" stroke="none">
        <path d="M6.325 1.7C3.94167 0.508334 1.83333 0.875 0 2.8C1.7875 4.81667 3.89583 5.1375 6.325 3.71667M6.69167 0.6C8.98333 -0.5 11.0458 -0.0874997 12.8333 1.8375C10.9542 3.67083 8.89167 3.9 6.64583 2.3875" />
      </g>
    </svg>
  );
}

export type ChosenOption = Option & { quantity: number };

const BUILDER_SELECTED_STORAGE = "terrascape_builder_selected_v1";
const BUILDER_SOIL_STORAGE = "terrascape_builder_soil_v1";
const BUILDER_CATEGORY_STORAGE = "terrascape_builder_category_v1";

function getStoredBuilderSelected(): string[] {
  try {
    const raw = sessionStorage.getItem(BUILDER_SELECTED_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredBuilderSoil(): SoilLayerSpec[] {
  try {
    const raw = sessionStorage.getItem(BUILDER_SOIL_STORAGE);
    return raw ? JSON.parse(raw) : SOIL_RECIPES.forest;
  } catch {
    return SOIL_RECIPES.forest;
  }
}

function getStoredBuilderCategory(): Category {
  try {
    const raw = sessionStorage.getItem(BUILDER_CATEGORY_STORAGE);
    if (raw === "Vessel" || raw === "Foundation" || raw === "Flora" || raw === "Details") {
      return raw;
    }
  } catch {}
  return "Vessel";
}

export function App() {
  const [route, setRoute] = useState<RouteInfo>(() => {
    if (typeof window === "undefined") {
      return { page: "home", path: "/collections" };
    }
    const current = parsePath(window.location.pathname);
    if (window.location.pathname === "/" || current.redirectFromRoot) {
      window.history.replaceState(null, "", "/collections");
    }
    return current;
  });

  const page = route.page;
  const { user: currentUser, signOut } = useAuth();
  const [selectedEdition, setSelectedEdition] = useState<EditionKey>(
    () => route.editionId || "cloud_forest"
  );
  const [activeCategory, setActiveCategory] = useState<Category>(getStoredBuilderCategory);
  const [selected, setSelected] = useState<string[]>(getStoredBuilderSelected);
  const [soilLayers, setSoilLayers] = useState<SoilLayerSpec[]>(getStoredBuilderSoil);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and returns focus to its button.
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Sync builder selections to session storage to persist across navigations/refreshes
  useEffect(() => {
    try {
      sessionStorage.setItem(BUILDER_SELECTED_STORAGE, JSON.stringify(selected));
    } catch {}
  }, [selected]);

  useEffect(() => {
    try {
      sessionStorage.setItem(BUILDER_SOIL_STORAGE, JSON.stringify(soilLayers));
    } catch {}
  }, [soilLayers]);

  useEffect(() => {
    try {
      sessionStorage.setItem(BUILDER_CATEGORY_STORAGE, activeCategory);
    } catch {}
  }, [activeCategory]);

  // Listen to browser Back and Forward button events
  useEffect(() => {
    const handlePopState = () => {
      const current = parsePath(window.location.pathname);
      if (window.location.pathname === "/" || current.redirectFromRoot) {
        window.history.replaceState(null, "", "/collections");
      }
      setRoute(current);
      if (current.editionId) {
        setSelectedEdition(current.editionId);
      }
      setMenuOpen(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (
    next: Page | string,
    options?: { replace?: boolean; editionId?: EditionKey }
  ) => {
    let targetEditionId = options?.editionId;
    if (next === "edition" && !targetEditionId) {
      targetEditionId = selectedEdition;
    }

    const { path, redirectFromRoot } = resolvePath(next, { editionId: targetEditionId });
    const nextRoute = parsePath(path);
    if (targetEditionId) {
      nextRoute.editionId = targetEditionId;
      setSelectedEdition(targetEditionId);
    } else if (nextRoute.editionId) {
      setSelectedEdition(nextRoute.editionId);
    }

    if (redirectFromRoot || options?.replace) {
      window.history.replaceState(null, "", nextRoute.path);
    } else if (window.location.pathname !== nextRoute.path) {
      window.history.pushState(null, "", nextRoute.path);
    }

    setRoute(nextRoute);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/collections");
  };

  const chosen: ChosenOption[] = useMemo(() => {
    return options
      .map((option) => ({
        ...option,
        quantity: selected.filter((id) => id === option.id).length,
      }))
      .filter((item) => item.quantity > 0);
  }, [selected]);

  const totalElements = useMemo(
    () => chosen.reduce((sum, item) => sum + item.quantity, 0),
    [chosen]
  );

  const subtotalCents = useMemo(
    () => chosen.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [chosen]
  );

  const openEdition = (key: EditionKey) => {
    setSelectedEdition(key);
    navigate(`/editions/${key}`, { editionId: key });
  };

  const loadSignaturePreset = (presetKey: keyof typeof SIGNATURE_PRESETS) => {
    const preset = SIGNATURE_PRESETS[presetKey];
    if (!preset) return;
    setSelected(preset.selected);
    setSoilLayers(SOIL_RECIPES[preset.recipeKey].map((l) => ({ ...l })));
    setActiveCategory("Vessel");
    navigate("/studio");
  };

  const toggleOption = (option: Option) => {
    if (option.category === "Foundation" && SOIL_RECIPES[option.id]) {
      setSoilLayers(SOIL_RECIPES[option.id].map((l) => ({ ...l })));
    }
    setSelected((current) => {
      const singleSelect = option.category === "Vessel" || option.category === "Foundation";
      if (singleSelect) {
        const withoutCategory = current.filter(
          (id) => options.find((item) => item.id === id)?.category !== option.category
        );
        return [...withoutCategory, option.id];
      }
      return current.includes(option.id)
        ? current.filter((id) => id !== option.id)
        : [...current, option.id];
    });
  };

  const adjustOptionQuantity = (option: Option, delta: number) => {
    setSelected((current) => {
      const currentCount = current.filter((id) => id === option.id).length;
      const nextCount = Math.max(0, Math.min(MAX_ELEMENT_QUANTITY, currentCount + delta));
      const withoutOption = current.filter((id) => id !== option.id);
      return [...withoutOption, ...Array(nextCount).fill(option.id)];
    });
  };

  const { openCart, itemCount, openTrackerModal, orders, addStandardItem, addCustomBlueprint } =
    useCart();

  // Opens the jar for everyone; signing in is only required at checkout.
  const addEditionToJar = (edition: StudioEdition) => {
    addStandardItem({
      type: "signature_build",
      name: `${edition.name} (${edition.edition})`,
      sku: edition.sku,
      description: `${edition.vessel} · Includes live flora, stratified substrates & integrated smart lid`,
    });
  };

  /** Adds the current Studio design to the jar. Returns the steps still missing, if any. */
  const addStudioDesignToJar = (): StudioCategory[] => {
    const result = buildStudioBlueprint(selected, soilLayers);
    // `in` narrows the union even without strictNullChecks.
    if ("missing" in result) return result.missing;
    addCustomBlueprint(result.blueprint);
    return [];
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          href="/"
          className="brand"
          onClick={(e) => handleLinkClick(e, "/")}
          aria-label="TerraScape home"
        >
          <LeafMark />
          <span>
            Terra<span className="brand-scape">Scape</span>
          </span>
        </a>
        <nav id="main-navigation" className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
          <a
            href="/collections"
            className={page === "home" ? "active" : ""}
            onClick={(e) => handleLinkClick(e, "/collections")}
          >
            Collection
          </a>
          <a
            href="/our-story"
            className={page === "about" || page === "design" ? "active" : ""}
            onClick={(e) => handleLinkClick(e, "/our-story")}
          >
            Our Story
          </a>
          <a
            href="/studio"
            className={page === "build" ? "active" : ""}
            onClick={(e) => handleLinkClick(e, "/studio")}
          >
            Studio
          </a>
          <a
            href="/terracare"
            className={page === "terracare" ? "active" : ""}
            onClick={(e) => handleLinkClick(e, "/terracare")}
          >
            TerraCare
          </a>
          <a
            href="/faq"
            className={page === "faq" ? "active" : ""}
            onClick={(e) => handleLinkClick(e, "/faq")}
          >
            FAQ
          </a>
        </nav>
        <div className="header-actions">
          {orders.length > 0 && (
            <button
              className="text-button"
              onClick={() => openTrackerModal()}
              title="Track Active Studio Builds"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#34d399",
                  display: "inline-block",
                }}
              />
              Tracker ({orders.length})
            </button>
          )}

          {currentUser ? (
            <a
              href="/account"
              className="text-button account-link"
              onClick={(e) => handleLinkClick(e, "/account")}
              title={`Signed in as ${currentUser.name}`}
            >
              Account
            </a>
          ) : (
            <button
              className="nav-cta-button"
              onClick={() => {
                setAuthMode("login");
                navigate("/account");
              }}
              title="Sign in or create a TerraScape account"
            >
              <span className="cta-label-full">Login / Create account</span>
              <span className="cta-label-short">Log in</span>
            </button>
          )}

          {(currentUser || itemCount > 0) && (
            <button className="bag-button" onClick={openCart} title="Open Your Jar">
              Your Jar <span>{itemCount}</span>
            </button>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            className={menuOpen ? "menu-button open" : "menu-button"}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        {page === "home" && (
          <Home navigate={navigate} openEdition={openEdition} />
        )}
        {page === "design" && <DesignPage navigate={navigate} selected={selected} />}
        {page === "build" && (
          <Builder
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selected={selected}
            toggleOption={toggleOption}
            adjustOptionQuantity={adjustOptionQuantity}
            soilLayers={soilLayers}
            setSoilLayers={setSoilLayers}
            totalElements={totalElements}
            subtotalCents={subtotalCents}
            onAddToJar={addStudioDesignToJar}
          />
        )}
        {page === "edition" && (
          <EditionDetailPage
            edition={STUDIO_EDITIONS[selectedEdition]}
            navigate={navigate}
            loadSignaturePreset={loadSignaturePreset}
            addEditionToJar={addEditionToJar}
          />
        )}
        {page === "terracare" && <TerraCarePage navigate={navigate} />}
        {page === "about" && <About navigate={navigate} selected={selected} />}
        {page === "faq" && <FaqPage navigate={navigate} />}
        {page === "account" && (
          <Account
            mode={authMode}
            setMode={setAuthMode}
            navigate={navigate}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
      </main>

      {page !== "build" && page !== "account" && (
        <footer>
          <div className="footer-brand">
            <div className="brand footer-wordmark">
              <LeafMark />
              <span>
                Terra<span className="brand-scape">Scape</span>
              </span>
            </div>
            <p>
              Small worlds,
              <br />
              grown with intention.
            </p>
          </div>
          <div>
            <strong>Explore</strong>
            <a
              href="/collections"
              onClick={(e) => handleLinkClick(e, "/collections")}
            >
              Collection
            </a>
            <a
              href="/our-story"
              onClick={(e) => handleLinkClick(e, "/our-story")}
            >
              Our Story
            </a>
            <a
              href="/studio"
              onClick={(e) => handleLinkClick(e, "/studio")}
            >
              Studio
            </a>
            <a
              href="/terracare"
              onClick={(e) => handleLinkClick(e, "/terracare")}
            >
              TerraCare
            </a>
            <a
              href="/faq"
              onClick={(e) => handleLinkClick(e, "/faq")}
            >
              FAQ
            </a>
          </div>
          <div className="newsletter">
            <strong>Notes from the greenhouse</strong>
            <p>Seasonal care, new flora, and studio stories from Los Angeles, CA.</p>
            <label>
              <input type="email" placeholder="Email address" />
              <button aria-label="Subscribe">
                <ArrowIcon />
              </button>
            </label>
          </div>
          <small>© 2026 TerraScape · Los Angeles, CA · Living worlds, made by hand.</small>
        </footer>
      )}
    </div>
  );
}

/**
 * HOME PAGE: Warm, photography-focused showcase of the living vessels (not overly technical).
 */
function Home({
  navigate,
  openEdition,
}: {
  navigate: (page: Page) => void;
  openEdition: (key: EditionKey) => void;
}) {
  return (
    <>
      <section className="hero collection-hero">
        <div className="hero-copy">
          <p className="eyebrow">Living objects, made by you</p>
          <h1>
            A world of green,
            <br />
            <em>under glass.</em>
          </h1>
          <p className="lead">
            Design a living landscape that’s entirely your own. We’ll hand-build it, nurture it in
            our greenhouse, and deliver it to your door.
          </p>
          <div className="hero-cta-row">
            <button className="primary-button" onClick={() => navigate("build")}>
              Build your terrarium <ArrowIcon />
            </button>
            <button
              type="button"
              className="secondary-outline-button"
              onClick={() => navigate("about")}
            >
              Explore our craft
            </button>
          </div>
          <div className="hero-note">
            <p>Every piece is assembled by hand in our Los Angeles, CA greenhouse.</p>
          </div>
        </div>
        <div className="hero-image collection-hero-image">
          <div className="collection-hero-card">
            <img
              src={images.hero}
              alt="A lush cylindrical TerraScape terrarium with a smooth white lid"
              className="collection-hero-photo"
            />
            <div className="image-caption">
              <span>Made to order</span>
              <strong>From {formatCents(studioStartingPriceCents())}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="intro">
        <p className="eyebrow">The collection</p>
        <h2>
          Wild at heart.
          <br />
          Considered by hand.
        </h2>
        <p>
          Choose a studio composition or use it as a starting point. Every environment is built to
          find its own balance and grow more beautiful over time.
        </p>
      </section>

      <section className="collection-grid">
        <article
          className="product-card"
          onClick={() => openEdition("cloud_forest")}
          style={{ cursor: "pointer" }}
        >
          <img src={images.collection} alt="The Cloud Forest studio edition terrarium" />
          <div className="product-card-body">
            <p className="eyebrow">Studio edition · 01</p>
            <h3>The Cloud Forest</h3>
            <p>Button fern, cushion moss, river stone</p>
            <span className="product-card-link">Explore edition &rarr;</span>
          </div>
        </article>
        <article
          className="product-card"
          onClick={() => openEdition("fern_study")}
          style={{ cursor: "pointer" }}
        >
          <img src={images.fern} alt="Fern Study studio edition terrarium" />
          <div className="product-card-body">
            <p className="eyebrow">Studio edition · 02</p>
            <h3>Fern Study</h3>
            <p>Button fern, fittonia, volcanic rock</p>
            <span className="product-card-link">Explore edition &rarr;</span>
          </div>
        </article>
        <article
          className="product-card"
          onClick={() => openEdition("moss_garden")}
          style={{ cursor: "pointer" }}
        >
          <img src={images.moss} alt="Moss Garden studio edition terrarium" />
          <div className="product-card-body">
            <p className="eyebrow">Studio edition · 03</p>
            <h3>Moss Garden</h3>
            <p>Cushion moss, selaginella, river stone</p>
            <span className="product-card-link">Explore edition &rarr;</span>
          </div>
        </article>
      </section>

      <section className="photo-editorial-band">
        <div className="photo-editorial-copy">
          <p className="eyebrow">Grown for everyday spaces</p>
          <h2>
            Quiet nature for desks,
            <br />
            bookshelves, and bedside tables.
          </h2>
          <p>
            Each vessel is self-sustaining, pairing hand-layered woodland substrates with gentle
            daylight and mist tucked quietly beneath its ceramic-finish lid.
          </p>
          <button className="text-arrow-link" onClick={() => navigate("terracare")}>
            Read our TerraCare guide <ArrowIcon />
          </button>
        </div>
        <div className="photo-editorial-pair">
          <img src={images.jar} alt="Glass terrarium on a wooden table" />
          <img src={images.moss} alt="Detail of living cushion moss" />
        </div>
      </section>

      <section className="cta-band">
        <span>Yours, naturally</span>
        <h2>
          No two ecosystems
          <br />
          grow the same.
        </h2>
        <button className="light-button" onClick={() => navigate("build")}>
          Begin your design <ArrowIcon />
        </button>
      </section>
    </>
  );
}

/**
 * DESIGN PAGE: Interactive 3D Showcase + Production Process Story.
 */
function DesignPage({
  navigate,
  selected,
}: {
  navigate: (page: Page) => void;
  selected: string[];
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Interactive 3D & Craft</p>
          <h1>
            Thoughtfully shaped,
            <br />
            <em>inside and out.</em>
          </h1>
          <p className="lead">
            Explore our circular apothecary vessel in 3D. Toggle the gentle canopy light and
            fogger, then see how each piece is crafted and planted in our studio.
          </p>
          <div className="hero-cta-row">
            <button className="primary-button" onClick={() => navigate("build")}>
              Customize yours in the Studio <ArrowIcon />
            </button>
          </div>
          <div className="hero-note">
            <span>3D</span>
            <p>
              Use the <strong>3D</strong> and <strong>Studio</strong> tabs on the viewer to rotate
              the vessel or toggle the <strong>Fogger</strong> and <strong>LED</strong>.
            </p>
          </div>
        </div>
        <div className="hero-image">
          <Terrarium3DShowcase
            selectedIds={selected}
            fallbackPhotoUrl={images.hero}
            captionTitle="Interactive 3D Vessel"
            captionPrice="Rotate 360° · Toggle Fogger & LED"
          />
        </div>
      </section>

      <section className="engineering-strip">
        <div className="eng-header">
          <p className="eyebrow">Our production process</p>
          <h2>
            How a TerraScape
            <br />
            <em>comes to life.</em>
          </h2>
          <p>
            Every terrarium moves through four unhurried stages in our Los Angeles, CA workshop—blending
            traditional glassmaking, small-batch lid fabrication, and patient greenhouse care.
          </p>
        </div>
        <div className="eng-cards four-col">
          <article>
            <span>Stage 01 · Vessel & Lid</span>
            <h3>Blown Glass & Collar</h3>
            <p>
              We start with a tall, clear circular glass jar and pair it with our custom-molded
              matte-white lid—available in a clean smooth profile or a softly fluted ridge finish.
            </p>
          </article>
          <article>
            <span>Stage 02 · Under the Lid</span>
            <h3>Quiet Light & Mist</h3>
            <p>
              Nestled directly beneath the lid is a slim unit that houses a warm full-spectrum
              grow light and a whisper-quiet fogger, powered by a clean white USB-A cable.
            </p>
          </article>
          <article>
            <span>Stage 03 · Earth & Stone</span>
            <h3>Layered by Hand</h3>
            <p>
              We build a five-layer foundation of clay pebbles, activated biochar, and rich
              woodland soil, then sculpt volcanic rock walls and weathered Mopani wood.
            </p>
          </article>
          <article>
            <span>Stage 04 · Acclimation</span>
            <h3>Grown Before It Ships</h3>
            <p>
              After planting ferns, fittonia, and pillow moss, each vessel rests in our greenhouse
              so the roots settle and the humidity cycle balances before delivery.
            </p>
          </article>
        </div>
      </section>

      <section className="story-grid">
        <img src={images.collection} alt="Handcrafted terrariums in the studio" />
        <div>
          <span className="chapter">Designed for longevity</span>
          <h2>Crafted so nature does the rest.</h2>
          <p>
            Most indoor plants struggle because home air is too dry and window light changes with
            the seasons. By enclosing the ecosystem under glass and tucking a gentle light and
            mister into the lid, your terrarium creates its own peaceful rain-forest cycle.
          </p>
          <p>
            Ready to choose your vessel, foundation, and plants? Step into our guided studio.
          </p>
          <button className="primary-button" onClick={() => navigate("build")}>
            Open the Studio <ArrowIcon />
          </button>
        </div>
      </section>
    </>
  );
}

/**
 * THE STUDIO: Calm 5-step guided builder with art-directed 2D layered preview.
 */
function Builder({
  activeCategory,
  setActiveCategory,
  selected,
  toggleOption,
  adjustOptionQuantity,
  soilLayers,
  setSoilLayers,
  totalElements,
  subtotalCents,
  onAddToJar,
  allowMultiQuantityFlora: controlledAllowMultiQuantityFlora,
}: {
  activeCategory: Category;
  setActiveCategory: (value: Category) => void;
  selected: string[];
  toggleOption: (option: Option) => void;
  adjustOptionQuantity: (option: Option, delta: number) => void;
  soilLayers: SoilLayerSpec[];
  setSoilLayers: (layers: SoilLayerSpec[]) => void;
  totalElements: number;
  subtotalCents: number;
  /** Adds the design to the jar; returns the required steps that are still empty. */
  onAddToJar: () => Category[];
  allowMultiQuantityFlora?: boolean;
}) {
  const [soilDrawerOpen, setSoilDrawerOpen] = useState(false);
  const [triedToAdd, setTriedToAdd] = useState(false);
  // Derived from the live selection so the message clears as soon as the step is filled.
  const missingSteps = SINGLE_CHOICE_CATEGORIES.filter(
    (category) => !selected.some((id) => getStudioOption(id)?.category === category)
  );
  const showMissing = triedToAdd && missingSteps.length > 0;

  const handleAddToJar = () => {
    setTriedToAdd(onAddToJar().length > 0);
  };
  // Feature toggle: By default FALSE (multi-select flora with NO duplicate quantities).
  // Can be toggled on/off internally or passed via prop.
  const [internalAllowMultiQuantityFlora, setInternalAllowMultiQuantityFlora] = useState(false);
  const allowMultiQuantityFlora = controlledAllowMultiQuantityFlora ?? internalAllowMultiQuantityFlora;

  const visible = options.filter((option) => option.category === activeCategory);
  const step = categories.indexOf(activeCategory) + 1;

  const updateSoilLayer = (id: string, field: "depthMm" | "contour", value: number) => {
    setSoilLayers(
      soilLayers.map((layer) => (layer.id === id ? { ...layer, [field]: value } : layer))
    );
  };

  return (
    <section className="builder">
      {/* Hidden toggle for 0-5 multi-quantity flora feature (saved for future reactivation) */}
      <button
        type="button"
        style={{ display: "none" }}
        data-testid="toggle-flora-multi-qty"
        aria-hidden="true"
        onClick={() => setInternalAllowMultiQuantityFlora((prev) => !prev)}
      >
        Toggle Flora 0-5 Quantities
      </button>

      <div className="builder-preview">
        <div className="builder-heading">
          <div>
            <p className="eyebrow">Your living world</p>
            <h1>Build with nature.</h1>
          </div>
        </div>

        <Terrarium2DLayeredView
          selectedIds={selected}
          soilLayers={soilLayers}
          captionTitle="Live Studio Preview"
          captionPrice={`${totalElements} elements · ${formatCents(subtotalCents)}`}
        />
      </div>

      <div className="builder-controls">
        <div className="progress">
          <span style={{ width: `${(step / categories.length) * 100}%` }} />
        </div>
        <div className="steps">
          {categories.map((category, index) => (
            <button
              key={category}
              className={category === activeCategory ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              <small>0{index + 1}</small>
              {category}
            </button>
          ))}
        </div>

        <div className="option-heading">
          <div>
            <div className="option-step-meta">
              <p className="eyebrow">Step 0{step}</p>
              <span className="selection-mode-badge">
                {activeCategory === "Vessel" || activeCategory === "Foundation"
                  ? "Single choice · Select 1"
                  : activeCategory === "Flora"
                    ? (allowMultiQuantityFlora
                        ? "Multi-select · Multiple quantities"
                        : "Multi-select · Choose any")
                    : "Multi-select · Choose any"}
              </span>
            </div>
            <h2>Choose your {activeCategory.toLowerCase()}.</h2>
          </div>
          <p className="option-instruction">
            {activeCategory === "Flora"
              ? (allowMultiQuantityFlora
                  ? "Select one or more plants below, and use the + / − controls to add multiple quantities of each."
                  : "Select one or more plants below to populate your living world.")
              : activeCategory === "Details"
                ? "Select one or more natural accents to sculpt your terrarium hardscape."
                : "Select one option below to continue."}
          </p>
        </div>

        {activeCategory === "Vessel" && (
          <div className="smart-lid-banner">
            <span className="smart-lid-badge-pill">✓ Standard on every order</span>
            <div className="smart-lid-banner-text">
              <strong>All-Inclusive Smart Climate Lid</strong>
              <p>
                Every TerraScape vessel arrives complete with Andrew&apos;s custom circadian LED lighting, active ventilation fan, and ultrasonic misting manifold integrated directly into the lid collar ($0 / included).
              </p>
            </div>
          </div>
        )}

        <div
          className="option-list"
          role={
            activeCategory === "Vessel" || activeCategory === "Foundation"
              ? "radiogroup"
              : "group"
          }
          aria-label={`${activeCategory} options`}
        >
          {visible.map((option) => {
            const qty = selected.filter((id) => id === option.id).length;
            const isSelected = qty > 0;
            const isSingleSelect =
              option.category === "Vessel" || option.category === "Foundation";
            const isMultiQty = allowMultiQuantityFlora && option.category === "Flora";

            if (isMultiQty) {
              return (
                <div
                  key={option.id}
                  className={isSelected ? "option selected option-qty-card" : "option option-qty-card"}
                  onClick={() => {
                    if (qty === 0) adjustOptionQuantity(option, 1);
                  }}
                >
                  {optionImages[option.id] && <img src={optionImages[option.id]} alt="" />}
                  <span className="check" aria-hidden="true">
                    {isSelected ? "✓" : "+"}
                  </span>
                  <span className="option-copy">
                    <strong>{option.name}</strong>
                    <small>{option.note}</small>
                  </span>
                  <div
                    className="qty-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label={`Decrease ${option.name} quantity`}
                      disabled={qty === 0}
                      onClick={() => adjustOptionQuantity(option, -1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label={`Increase ${option.name} quantity`}
                      disabled={qty >= 5}
                      onClick={() => adjustOptionQuantity(option, 1)}
                    >
                      +
                    </button>
                  </div>
                  <b className="option-price">
                    +{formatCents(option.priceCents * Math.max(qty, 1))}
                    {qty > 1 && <small> ({formatCents(option.priceCents)} ea)</small>}
                  </b>
                </div>
              );
            }

            return (
              <button
                key={option.id}
                type="button"
                role={isSingleSelect ? "radio" : "checkbox"}
                aria-checked={isSelected}
                className={isSelected ? "option selected" : "option"}
                onClick={() => toggleOption(option)}
              >
                {optionImages[option.id] && <img src={optionImages[option.id]} alt="" />}
                {isSingleSelect ? (
                  <span className="radio" aria-hidden="true">
                    <span className="radio-dot" />
                  </span>
                ) : (
                  <span className="check" aria-hidden="true">
                    {isSelected ? "✓" : ""}
                  </span>
                )}
                <span className="option-copy">
                  <strong>{option.name}</strong>
                  <small>{option.note}</small>
                </span>
                <b>+{formatCents(option.priceCents)}</b>
              </button>
            );
          })}
        </div>

        {activeCategory === "Foundation" && (
          <div className="soil-customizer-drawer">
            <button
              type="button"
              className="soil-drawer-toggle"
              onClick={() => setSoilDrawerOpen(!soilDrawerOpen)}
            >
              <span>
                <strong>Adjust soil layer depths ({soilLayers.length} layers)</strong>
                <small>Optional: fine-tune the height and wave slope of each earth layer</small>
              </span>
              <b>{soilDrawerOpen ? "Hide −" : "Customize +"}</b>
            </button>

            {soilDrawerOpen && (
              <div className="soil-sliders-list">
                {soilLayers.map((layer) => (
                  <div key={layer.id} className="soil-slider-row">
                    <div className="soil-slider-header">
                      <span
                        className="soil-swatch"
                        style={{ backgroundColor: layer.colorTop }}
                      />
                      <strong>{layer.name}</strong>
                      <small>{layer.role}</small>
                    </div>
                    <div className="soil-slider-inputs">
                      <label>
                        <span>Depth</span>
                        <input
                          type="range"
                          min={SOIL_DEPTH_RANGE_MM.min}
                          max={SOIL_DEPTH_RANGE_MM.max}
                          value={layer.depthMm}
                          onChange={(e) =>
                            updateSoilLayer(layer.id, "depthMm", Number(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        <span>Wave contour</span>
                        <input
                          type="range"
                          min={SOIL_CONTOUR_RANGE.min}
                          max={SOIL_CONTOUR_RANGE.max}
                          value={layer.contour}
                          onChange={(e) =>
                            updateSoilLayer(layer.id, "contour", Number(e.target.value))
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showMissing && (
          <div className="builder-missing" role="alert">
            <p>
              Choose a {missingSteps.map((category) => category.toLowerCase()).join(" and a ")}{" "}
              before adding your design to the jar.
            </p>
            <div className="builder-missing-actions">
              {missingSteps.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="text-button"
                  onClick={() => setActiveCategory(category)}
                >
                  Go to step 0{categories.indexOf(category) + 1} · {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === categories.length && (
          <p className="builder-assembly-note">
            Courier and pickup orders are planted and assembled in our Los Angeles studio
            (+{formatCents(ASSEMBLY_FEE_CENTS)} per build). Choose nationwide shipping in your jar to
            receive it as a DIY kit instead.
          </p>
        )}

        <div className="builder-footer">
          <div>
            <small>Design total · before assembly &amp; delivery</small>
            <strong>{formatCents(subtotalCents)}</strong>
          </div>
          {step < categories.length ? (
            <button
              className="primary-button"
              onClick={() => setActiveCategory(categories[step])}
            >
              Continue <ArrowIcon />
            </button>
          ) : (
            <button className="primary-button" onClick={handleAddToJar}>
              Add to Your Jar <ArrowIcon />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * TERRACARE PAGE: Assembly instructions + ongoing care guide.
 */
function TerraCarePage({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <section className="about-hero">
        <div>
          <p className="eyebrow">TerraCare & Assembly</p>
          <h1>
            Simple rituals for a
            <br />
            <em>thriving world.</em>
          </h1>
        </div>
        <p className="lead">
          Your TerraScape is designed to be effortless. Follow these calm, step-by-step guides to
          assemble your kit when it arrives and keep your moss and ferns vibrant year-round.
        </p>
      </section>

      <section className="engineering-strip">
        <div className="eng-header">
          <p className="eyebrow">Part 01 · Assembly guide</p>
          <h2 className="care-section-title">
            Setting up your
            <br />
            <em>terrarium in 15 minutes.</em>
          </h2>
          <p>
            Whether you ordered a pre-planted studio build or a hands-on planting kit, unpacking
            and seating each layer takes just a few mindful steps.
          </p>
        </div>
        <div className="eng-cards four-col">
          <article className="step-card">
            <div className="step-card-body">
              <span>Step 01 · Prepare</span>
              <h3>Unpack & Wipe Glass</h3>
              <p>
                Remove the protective paper wrap and wipe the inside of the glass jar with a soft
                damp cloth. Set the jar on a flat, stable surface away from direct midday sun.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.jar}
              alt="Step 01 placeholder: Unpacking and wiping the glass vessel"
            />
          </article>
          <article className="step-card">
            <div className="step-card-body">
              <span>Step 02 · Foundation</span>
              <h3>Pour the Earth Layers</h3>
              <p>
                Pour the clay drainage pebbles first, followed by the thin layer of activated biochar,
                then gently mound the pre-moistened woodland soil blend into a soft slope.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.collection}
              alt="Step 02 placeholder: Pouring the drainage pebbles, biochar, and woodland soil"
            />
          </article>
          <article className="step-card">
            <div className="step-card-body">
              <span>Step 03 · Hardscape & Flora</span>
              <h3>Nestle Stones, Moss & Ferns</h3>
              <p>
                Anchor your volcanic rocks or Mopani branch first. Tuck the roots of your ferns and
                fittonia into the soil, then press the cushion moss gently around them like a blanket.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.fern}
              alt="Step 03 placeholder: Nestling stones, ferns, and cushion moss"
            />
          </article>
          <article className="step-card">
            <div className="step-card-body">
              <span>Step 04 · Lid & USB-A Power</span>
              <h3>Fill & Seat the Lid</h3>
              <p>
                Open the small top hatch on the white lid, add distilled water to the fogger
                reservoir, place the lid onto the jar rim, and plug in the attached white USB-A
                cable.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.hero}
              alt="Step 04 placeholder: Filling the reservoir and seating the matte-white lid"
            />
          </article>
        </div>
      </section>

      <section className="values">
        <div className="eng-header">
          <p className="eyebrow">Part 02 · Ongoing care</p>
          <h2 className="care-section-title">How to care for your ecosystem.</h2>
        </div>
        <div className="value-grid">
          <article>
            <span>01</span>
            <h3>Water & Mist</h3>
            <p>
              Always use <strong>distilled or rainwater</strong> (tap water leaves mineral spots on
              the glass and moss). Run the fogger for 5–10 minutes every few days, or whenever the
              moss feels slightly dry to the touch.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Reading the Glass</h3>
            <p>
              A light veil of morning mist on the glass is a sign of a healthy water cycle. If
              heavy droplets cover the entire jar all day, crack the lid or run the fan for an hour
              to let excess moisture breathe.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Light & Pruning</h3>
            <p>
              The built-in Halo LED provides all the light your plants need (8–10 hours a day is
              ideal). If a fern frond grows tall enough to press against the lid, snip it cleanly
              at the base with small scissors.
            </p>
          </article>
        </div>
      </section>

      <section className="signup-panel">
        <div>
          <p className="eyebrow">Need a hand?</p>
          <h2>
            Questions about
            <br />
            your plants?
          </h2>
          <p>
            Browse our common questions or reach out to our greenhouse team anytime for personalized
            plant care advice.
          </p>
          <button className="primary-button" onClick={() => navigate("faq")}>
            Visit our FAQ <ArrowIcon />
          </button>
        </div>
        <img src={images.moss} alt="Lush cushion moss inside a glass vessel" />
      </section>
    </>
  );
}

/**
 * FAQ PAGE: Interactive accordion dropdowns for showing and hiding answers.
 */
const FAQ_SECTIONS = [
  {
    category: "Ordering & Customization",
    items: [
      {
        q: "Do I need to place each plant myself in the online builder?",
        a: "Not at all. In The Studio, you simply choose which plants and natural details you love. Our greenhouse team—and our live preview—automatically arranges them in balanced foreground, midground, and background layers so every plant has room to thrive.",
      },
      {
        q: "What is the difference between the Smooth Lid and the Ridged Lid?",
        a: "Both lids are crafted in a warm matte-white finish and house the exact same under-lid light and fogger options. The Smooth Lid offers a quiet, minimalist cylinder silhouette, while the Ridged Lid features subtle diagonal fluting around the outer collar.",
      },
      {
        q: "How long does it take to build and ship my custom terrarium?",
        a: `Studio builds are soldered, planted and rested for ${QUARANTINE_HOURS} hours in our Los Angeles, CA studio, then hand-delivered by our Southern California courier or ready for pickup in ${DELIVERY_OPTIONS.courier.leadBusinessDays.min}–${DELIVERY_OPTIONS.courier.leadBusinessDays.max} business days. Nationwide orders ship as DIY kits within ${DELIVERY_OPTIONS.shipped.leadBusinessDays.min}–${DELIVERY_OPTIONS.shipped.leadBusinessDays.max} business days; shipping is ${formatCents(SHIPPED_FEE_CENTS)}, free on orders over ${formatCents(FREE_SHIPPING_THRESHOLD_CENTS)}.`,
      },
    ],
  },
  {
    category: "TerraCare, Power & Maintenance",
    items: [
      {
        q: "How is the terrarium lid powered?",
        a: "The under-lid light and fogger unit is powered by an attached white USB-A cable that exits cleanly through the back of the lid collar. You can plug it into any standard 5V USB-A wall adapter, desktop port, or smart USB timer.",
      },
      {
        q: "How often do I need to water my terrarium?",
        a: "Closed circular terrariums recycle their own moisture. Typically, running the built-in fogger for a few minutes once or twice a week—and refilling the top reservoir with distilled water every 3–4 weeks—is all that is needed.",
      },
      {
        q: "What kind of water should I use in the fogger reservoir?",
        a: "We recommend distilled water or filtered rainwater. Hard tap water contains minerals that can cloud the glass over time and clog the ultrasonic misting disc.",
      },
      {
        q: "Does my terrarium need natural window light if it has the Halo LED?",
        a: "No window is required! The warm full-spectrum Halo LED built into the under-lid unit provides everything your ferns, fittonia, and moss need, even in windowless offices or interior bookshelves.",
      },
    ],
  },
  {
    category: "Shipping & Guarantee",
    items: [
      {
        q: "How does a living glass terrarium ship safely?",
        a: "Each component is cushioned in custom molded biodegradable packaging, and living plants are secured in breathable moss wraps so nothing shifts in transit. Full step-by-step assembly instructions are available on our TerraCare page.",
      },
      {
        q: "What if a plant arrives damaged?",
        a: `Every order is backed by our ${ARRIVAL_GUARANTEE_DAYS}-Day Living Arrival Guarantee. If your glass vessel or any plant arrives in less than healthy condition, send us a photo and we will replace it free of charge.`,
      },
    ],
  },
];

function FaqPage({ navigate }: { navigate: (page: Page) => void }) {
  // Every question starts closed. The page unmounts when the shopper leaves, so this resets on each visit.
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  return (
    <>
      <section className="about-hero">
        <div>
          <p className="eyebrow">Frequently asked questions</p>
          <h1>
            Everything you need
            <br />
            <em>to know.</em>
          </h1>
        </div>
        <p className="lead">
          From choosing your lid finish in the Studio to keeping your moss dewy year-round, here
          are answers to our most common questions.
        </p>
      </section>

      <section className="faq-section">
        {FAQ_SECTIONS.map((group) => (
          <div key={group.category} className="faq-group">
            <h2 className="faq-group-title">{group.category}</h2>
            <div className="faq-accordion-list">
              {group.items.map((item, idx) => {
                const key = `${group.category}-${idx}`;
                const isOpen = openKey === key;
                return (
                  <div
                    key={key}
                    className={`faq-accordion-item ${isOpen ? "open" : ""}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn"
                      aria-expanded={isOpen}
                      onClick={() => toggleItem(key)}
                    >
                      <span>{item.q}</span>
                      <b className="faq-icon" aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </b>
                    </button>
                    {isOpen && (
                      <div className="faq-answer-panel">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="cta-band">
        <span>Ready to begin?</span>
        <h2>
          Design a miniature world
          <br />
          of your own.
        </h2>
        <button className="light-button" onClick={() => navigate("build")}>
          Open the Studio <ArrowIcon />
        </button>
      </section>
    </>
  );
}

function About({
  navigate,
  selected,
}: {
  navigate: (page: Page) => void;
  selected: string[];
}) {
  return (
    <>
      <section className="about-hero">
        <div>
          <p className="eyebrow">Our philosophy</p>
          <h1>
            Bring the outside
            <br />
            <em>closer.</em>
          </h1>
        </div>
        <p className="lead">
          We make miniature living worlds for people who want more nature in the everyday—without
          needing a green thumb.
        </p>
      </section>
      <section className="story-grid">
        <img src={images.jar} alt="Terrarium on a wooden studio table" />
        <div>
          <span className="chapter">01 — The beginning</span>
          <h2>Born from a love of small things.</h2>
          <p>
            TerraScape began at a kitchen table, with a borrowed glass jar and a handful of moss
            from the California coast. That first tiny landscape became a daily ritual: mist, observe,
            notice what had changed.
          </p>
          <p>
            Today, we build each piece with the same attention. Our terrariums are living objects,
            designed to evolve alongside you.
          </p>
        </div>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">02 — Interactive 3D & Craft</p>
          <h1>
            Thoughtfully shaped,
            <br />
            <em>inside and out.</em>
          </h1>
          <p className="lead">
            Explore our circular apothecary vessel in 3D. Toggle the gentle canopy light and
            fogger, then see how each piece is crafted and planted in our studio.
          </p>
          <div className="hero-cta-row">
            <button className="primary-button" onClick={() => navigate("build")}>
              Customize yours in the Studio <ArrowIcon />
            </button>
          </div>
          <div className="hero-note">
            <span>3D</span>
            <p>
              Use the <strong>3D</strong> and <strong>Studio</strong> tabs on the viewer to rotate
              the vessel or toggle the <strong>Fogger</strong> and <strong>LED</strong>.
            </p>
          </div>
        </div>
        <div className="hero-image">
          <Terrarium3DShowcase
            selectedIds={selected}
            fallbackPhotoUrl={images.hero}
            captionTitle="Interactive 3D Vessel"
            captionPrice="Rotate 360° · Toggle Fogger & LED"
          />
        </div>
      </section>

      <section className="engineering-strip">
        <div className="eng-header">
          <p className="eyebrow">Our production process</p>
          <h2>
            How a TerraScape
            <br />
            <em>comes to life.</em>
          </h2>
          <p>
            Every terrarium moves through four unhurried stages in our Los Angeles, CA workshop—blending
            traditional glassmaking, small-batch lid fabrication, and patient greenhouse care.
          </p>
        </div>
        <div className="eng-cards four-col">
          <article className="step-card">
            <div className="step-card-body">
              <span>Stage 01 · Vessel & Lid</span>
              <h3>Blown Glass & Collar</h3>
              <p>
                We start with a tall, clear circular glass jar and pair it with our custom-molded
                matte-white lid—available in a clean smooth profile or a softly fluted ridge finish.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.jar}
              alt="Stage 01 placeholder: Hand-blown circular glass jar and matte-white collar lid"
            />
          </article>
          <article className="step-card">
            <div className="step-card-body">
              <span>Stage 02 · Under the Lid</span>
              <h3>Quiet Light & Mist</h3>
              <p>
                Nestled directly beneath the lid is a slim unit that houses a warm full-spectrum
                grow light and a whisper-quiet fogger, powered by a clean white USB-A cable.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.hero}
              alt="Stage 02 placeholder: Under-lid warm LED light and ultrasonic fogger unit"
            />
          </article>
          <article className="step-card">
            <div className="step-card-body">
              <span>Stage 03 · Earth & Stone</span>
              <h3>Layered by Hand</h3>
              <p>
                We build a five-layer foundation of clay pebbles, activated biochar, and rich
                woodland soil, then sculpt volcanic rock walls and weathered Mopani wood.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.collection}
              alt="Stage 03 placeholder: Hand-layered drainage pebbles, biochar, soil, and stone"
            />
          </article>
          <article className="step-card">
            <div className="step-card-body">
              <span>Stage 04 · Acclimation</span>
              <h3>Grown Before It Ships</h3>
              <p>
                After planting ferns, fittonia, and pillow moss, each vessel rests in our greenhouse
                so the roots settle and the humidity cycle balances before delivery.
              </p>
            </div>
            <img
              className="step-card-img"
              src={images.fern}
              alt="Stage 04 placeholder: Planted terrarium acclimating in our Los Angeles studio"
            />
          </article>
        </div>
      </section>

      <section className="values">
        <p className="eyebrow">What guides us</p>
        <div className="value-grid">
          <article>
            <span>01</span>
            <h3>Grounded</h3>
            <p>
              Natural materials, honest forms, calm confidence. We choose plants that thrive
              together in resilient ecosystems.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Artful</h3>
            <p>
              Every composition is considered, never ornamental. Every layer is placed and tucked by
              hand in our greenhouse.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Alive</h3>
            <p>
              A brand with movement, variation, and room to grow. Your home and habits shape a
              miniature world that belongs.
            </p>
          </article>
        </div>
      </section>
      <section className="signup-panel">
        <div>
          <p className="eyebrow">Join the studio</p>
          <h2>
            Save your worlds.
            <br />
            Watch them grow.
          </h2>
          <p>
            Create an account to save designs, track orders, and receive care notes tailored to your
            terrarium.
          </p>
          <button className="primary-button" onClick={() => navigate("account")}>
            Create an account <ArrowIcon />
          </button>
        </div>
        <img src={images.fern} alt="Lush green fern in a terrarium" />
      </section>
    </>
  );
}

function Account({
  mode,
  setMode,
  navigate,
  currentUser,
  onLogout,
}: {
  mode: "signup" | "login";
  setMode: (mode: "signup" | "login") => void;
  navigate: (page: Page) => void;
  currentUser: UserProfile | null;
  onLogin?: (user: UserProfile) => void;
  onLogout: () => void;
}) {
  const { openCart, itemCount, openTrackerModal, orders } = useCart();
  const { signIn, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    const result = await signIn("google");
    if (!result.ok && result.error) {
      setErrorMsg(result.error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string) || "";
    const fullName = (formData.get("fullName") as string)?.trim() || "";

    const result = await signIn("credentials", {
      email,
      password,
      name: fullName,
      isSignUp: mode === "signup",
    });

    if (!result.ok && result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <section className="account-page">
      <div className="account-image">
        <img src={images.moss} alt="A peaceful miniature moss landscape" />
        <blockquote>
          “The world is full of magic things, patiently waiting for our senses to grow sharper.”
          <cite>— W.B. Yeats</cite>
        </blockquote>
      </div>

      {currentUser ? (
        <div className="account-form">
          <p className="eyebrow">Greenhouse Collector Profile</p>
          <h1>Welcome, {currentUser.name}.</h1>
          <p>
            You are signed into your TerraScape collector account. Manage your bespoke terrarium
            blueprints, active workshop orders, and botanical care notes.
          </p>

          <div className="account-dashboard">
            <div className="account-profile-card">
              <div className="account-profile-row">
                <span>Collector Name</span>
                <strong>{currentUser.name}</strong>
              </div>
              <div className="account-profile-row">
                <span>Email Address</span>
                <strong>{currentUser.email}</strong>
              </div>
              <div className="account-profile-row">
                <span>Authentication Method</span>
                <strong style={{ color: "var(--ts-forest)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399", display: "inline-block" }} />
                  {currentUser.provider === "google" ? "Google OAuth Verified" : "Email & Password"}
                </strong>
              </div>
              <div className="account-profile-row">
                <span>Member Since</span>
                <strong>
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </strong>
              </div>
              <div className="account-profile-row">
                <span>Items in Your Jar</span>
                <strong>{itemCount} build(s)</strong>
              </div>
              {orders.length > 0 && (
                <div className="account-profile-row">
                  <span>Active Assembly Orders</span>
                  <strong style={{ color: "#22c55e" }}>{orders.length} order(s) in progress</strong>
                </div>
              )}
            </div>

            <div className="account-actions-row">
              {itemCount > 0 ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={openCart}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  Open Your Jar ({itemCount}) <ArrowIcon />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate("home")}
                >
                  Browse Collection <ArrowIcon />
                </button>
              )}
              {orders.length > 0 && (
                <button
                  type="button"
                  className="secondary-outline-button"
                  onClick={() => openTrackerModal()}
                >
                  Track Assembly ({orders.length})
                </button>
              )}
              <button
                type="button"
                className="secondary-outline-button"
                onClick={() => navigate("build")}
              >
                Design in Studio
              </button>
              <button
                type="button"
                className="text-button"
                onClick={onLogout}
                style={{
                  color: "var(--ts-clay)",
                  fontWeight: 600,
                  padding: "0.55rem 0.95rem",
                  border: "1px solid var(--ts-border)",
                  borderRadius: "2px",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-form">
          <div className="auth-tabs">
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
            >
              Create account
            </button>
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
            >
              Sign in
            </button>
          </div>
          <p className="eyebrow">Welcome to the greenhouse</p>
          <h1>{mode === "signup" ? "Grow with us." : "Welcome back."}</h1>
          <p>
            {mode === "signup"
              ? "Create an account to access Your Jar, save custom terrarium blueprints, and track living workshop orders."
              : "Sign in to access Your Jar, view your saved terrarium designs, and track your builds."}
          </p>

          {/* Google sign-in is simulated until Phase 3 auth, so it only shows in development builds. */}
          {import.meta.env.DEV && (
          <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "4px",
              border: "1px solid var(--ts-border)",
              background: "#ffffff",
              color: "#1f2937",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "1.25rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div
            style={{
              position: "relative",
              textAlign: "center",
              margin: "1.25rem 0",
              borderTop: "1px solid var(--ts-border)",
            }}
          >
            <span
              style={{
                position: "relative",
                top: "-0.65rem",
                background: "var(--ts-cream)",
                padding: "0 0.75rem",
                fontSize: "0.75rem",
                color: "var(--ts-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Or with email
            </span>
          </div>
          </>
          )}

          {errorMsg && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#dc2626",
                padding: "0.6rem 0.8rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label>
                Full name
                <input required name="fullName" type="text" placeholder="Your name" autoComplete="name" />
              </label>
            )}
            <label>
              Email address
              <input required name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            </label>
            <label>
              Password
              <input
                required
                name="password"
                type="password"
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                minLength={mode === "signup" ? 8 : undefined}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
            <button className="primary-button" type="submit" disabled={isLoading}>
              {mode === "signup" ? "Create my account" : "Sign in"} <ArrowIcon />
            </button>
          </form>
          <small>By continuing, you agree to our Terms and Privacy Policy.</small>
        </div>
      )}
    </section>
  );
}

export default function AppWithModals() {
  return (
    <>
      <App />
      <CartDrawer />
      <StripeCheckoutModal />
      <OrderTrackerModal />
      <AuthModal />
    </>
  );
}
