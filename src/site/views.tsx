"use client";

import { useState } from "react";
import Terrarium3DShowcase from "../Terrarium3DShowcase";
import Terrarium2DLayeredView from "../Terrarium2DLayeredView";
import {
  ARRIVAL_GUARANTEE_DAYS,
  ASSEMBLY_FEE_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPED_FEE_CENTS,
  STUDIO_REQUIRED_CATEGORIES,
  SOIL_CONTOUR_RANGE,
  SOIL_DEPTH_RANGE_MM,
  STUDIO_CATEGORIES,
  STUDIO_OPTIONS,
  getStudioOption,
  studioStartingPriceCents,
  type SoilLayerSpec,
  type StudioCategory,
  type StudioOption,
} from "../catalog";
import { formatCents } from "../catalog/money";
import { DELIVERY_OPTIONS, QUARANTINE_HOURS } from "../catalog/delivery";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { User as UserProfile } from "../types/auth";
import { furthestReachableStep, isStudioStepComplete } from "../catalog/studioBlueprint";
import { EditionDetailPage } from "../components/EditionDetailPage";
import type { Page, EditionKey } from "../utils/router";
import { STUDIO_EDITIONS, images, type StudioEdition } from "../catalog/editions";
import { useStudio } from "./StudioContext";
import { useAppNavigate } from "./navigation";
import { ADD_TO_JAR_PROMPT, useSignedInAction } from "./useSignedInAction";

type Category = StudioCategory;
type Option = StudioOption;

// Studio option photos, keyed by Studio option id. Empty until there are real photos of each
// option (the flora list is still a placeholder); cards without a photo show text only.
const optionImages: Partial<Record<string, string>> = {};

// The soil layer depth/contour controls under Foundation. Hidden for now; the component and
// the default layer recipes stay in place, so set this to true to bring them back.
const SHOW_SOIL_CUSTOMIZER = false;

const options = STUDIO_OPTIONS;
const categories = STUDIO_CATEGORIES;

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

export function LeafMark() {
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
 * THE STUDIO: Calm 5-step guided builder with art-directed 2D layered preview.
 */
/** How each required step is described in hints and the missing-steps message. */
const STEP_REQUIREMENT: Record<Category, string> = {
  Vessel: "a vessel",
  Foundation: "a foundation",
  Flora: "at least one plant",
  Details: "at least one detail",
};

/** "a", "a and b", "a, b and c" */
function listPhrases(phrases: string[]): string {
  return phrases.length <= 1 ? phrases.join("") : `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`;
}

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
  const { isAuthenticated } = useAuth();
  // Derived from the live selection so messages clear as soon as a step is filled.
  const missingSteps = STUDIO_REQUIRED_CATEGORIES.filter(
    (category) => !isStudioStepComplete(category, selected)
  );
  const showMissing = triedToAdd && missingSteps.length > 0;
  const currentStepComplete = isStudioStepComplete(activeCategory, selected);
  const reachableIndex = categories.indexOf(furthestReachableStep(selected));
  // No soil in the preview until a foundation is chosen: the Studio starts as an empty jar.
  const hasFoundation = selected.some((id) => getStudioOption(id)?.category === "Foundation");

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
          soilLayers={hasFoundation ? soilLayers : []}
          captionTitle="Live Studio Preview"
          captionPrice={`${totalElements} ${totalElements === 1 ? "element" : "elements"} · ${formatCents(subtotalCents)}`}
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
              disabled={index > reachableIndex}
              title={
                index > reachableIndex
                  ? `Finish step 0${reachableIndex + 1} · ${categories[reachableIndex]} first`
                  : undefined
              }
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
                    : STUDIO_REQUIRED_CATEGORIES.includes(activeCategory)
                      ? "Multi-select · Choose any"
                      : "Optional · Choose any"}
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
                Every TerraScape vessel arrives complete with our team&apos;s custom circadian LED lighting, active ventilation fan, and ultrasonic misting manifold integrated directly into the lid collar ($0 / included).
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

        {SHOW_SOIL_CUSTOMIZER && activeCategory === "Foundation" && (
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
              Choose {listPhrases(missingSteps.map((category) => STEP_REQUIREMENT[category]))} before
              adding your design to the jar.
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
            {!isAuthenticated && " You'll sign in or create a free account to save your design to your jar."}
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
              disabled={!currentStepComplete}
              aria-describedby={currentStepComplete ? undefined : "builder-step-hint"}
            >
              Continue <ArrowIcon />
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={handleAddToJar}
              disabled={!currentStepComplete}
              aria-describedby={currentStepComplete ? undefined : "builder-step-hint"}
            >
              Add to Your Jar <ArrowIcon />
            </button>
          )}
        </div>
        <p id="builder-step-hint" className="builder-step-hint" aria-live="polite">
          {currentStepComplete
            ? ""
            : `Choose ${STEP_REQUIREMENT[activeCategory]} to ${step < categories.length ? "continue" : "add your design to the jar"}.`}
        </p>
      </div>
    </section>
  );
}

/**
 * NOT FOUND PAGE: shown for mistyped or outdated links. The route sets the title, the noindex tag
 * and the 404 status.
 */
function NotFoundPage({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <section className="about-hero not-found">
      <div>
        <p className="eyebrow">Page not found</p>
        <h1>
          This corner of the
          <br />
          <em>garden is empty.</em>
        </h1>
      </div>
      <div>
        <p className="lead">
          The page you were looking for doesn&apos;t exist or has moved. Try one of these instead.
        </p>
        <div className="not-found-actions">
          <button className="primary-button" onClick={() => navigate("home")}>
            Browse the collection <ArrowIcon />
          </button>
          <button className="secondary-outline-button" onClick={() => navigate("build")}>
            Design in the Studio
          </button>
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


// ---------------------------------------------------------------------------
// Route views: each App Router page renders one of these. They connect the page components
// above to the shared Studio state, the cart and the router.
// ---------------------------------------------------------------------------

export function CollectionsView() {
  const navigate = useAppNavigate();
  return <Home navigate={navigate} openEdition={(key) => navigate(`/editions/${key}`)} />;
}

export function StudioView() {
  const studio = useStudio();
  return (
    <Builder
      activeCategory={studio.activeCategory}
      setActiveCategory={studio.setActiveCategory}
      selected={studio.selected}
      toggleOption={studio.toggleOption}
      adjustOptionQuantity={studio.adjustOptionQuantity}
      soilLayers={studio.soilLayers}
      setSoilLayers={studio.setSoilLayers}
      totalElements={studio.totalElements}
      subtotalCents={studio.subtotalCents}
      onAddToJar={studio.addStudioDesignToJar}
    />
  );
}

export function OurStoryView() {
  const navigate = useAppNavigate();
  const { selected } = useStudio();
  return <About navigate={navigate} selected={selected} />;
}

export function TerraCareView() {
  return <TerraCarePage navigate={useAppNavigate()} />;
}

export function FaqView() {
  return <FaqPage navigate={useAppNavigate()} />;
}

export function NotFoundView() {
  return <NotFoundPage navigate={useAppNavigate()} />;
}

export function EditionView({ id }: { id: EditionKey }) {
  const navigate = useAppNavigate();
  const { loadSignaturePreset } = useStudio();
  const { addStandardItem } = useCart();
  const runSignedIn = useSignedInAction();

  // Adding to the jar needs an account; guests are asked to sign in first.
  const addEditionToJar = (edition: StudioEdition) => {
    runSignedIn(
      () =>
        addStandardItem({
          type: "signature_build",
          name: `${edition.name} (${edition.edition})`,
          sku: edition.sku,
          description: `${edition.vessel} · Includes live flora, stratified substrates & integrated smart lid`,
        }),
      ADD_TO_JAR_PROMPT
    );
  };

  return (
    <EditionDetailPage
      edition={STUDIO_EDITIONS[id]}
      navigate={navigate}
      loadSignaturePreset={loadSignaturePreset}
      addEditionToJar={addEditionToJar}
    />
  );
}

/** `initialMode` comes from `/account?mode=login` (the header's sign-in link). */
export function AccountView({ initialMode }: { initialMode: "signup" | "login" }) {
  const navigate = useAppNavigate();
  const { user: currentUser, signOut } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [modeFromUrl, setModeFromUrl] = useState(initialMode);
  if (modeFromUrl !== initialMode) {
    setModeFromUrl(initialMode);
    setMode(initialMode);
  }

  return (
    <Account
      mode={mode}
      setMode={setMode}
      navigate={navigate}
      currentUser={currentUser}
      onLogout={async () => {
        await signOut();
        navigate("/collections");
      }}
    />
  );
}
