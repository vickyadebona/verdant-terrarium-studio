import type { Page, EditionKey, StudioEdition } from "../App";

interface EditionDetailPageProps {
  edition: StudioEdition;
  navigate: (page: Page | string) => void;
  loadSignaturePreset: (key: EditionKey) => void;
  addEditionToJar: (edition: StudioEdition) => void;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 10h11M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function JarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M7 4h10M6 8h12M7 8v11a2 2 0 002 2h6a2 2 0 002-2V8M9 4v4M15 4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EditionDetailPage({
  edition,
  navigate,
  loadSignaturePreset,
  addEditionToJar,
}: EditionDetailPageProps) {
  return (
    <div className="edition-page">
      {/* HERO SECTION */}
      <section className="edition-hero">
        <div className="edition-hero-copy">
          <a
            href="/collections"
            className="text-arrow-link"
            style={{
              marginBottom: "1.25rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              alignSelf: "flex-start",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              textDecoration: "none",
            }}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              navigate("/collections");
            }}
          >
            &larr; Back to Collection
          </a>

          <p className="eyebrow">{edition.edition}</p>
          <h1>{edition.name}</h1>
          <p className="edition-tagline">“{edition.tagline}”</p>
          <p className="lead">{edition.overview}</p>

          <div className="edition-meta-strip">
            <span className="edition-meta-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="3" width="14" height="18" rx="2" />
              </svg>
              {edition.vessel}
            </span>
            <span className="edition-meta-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              Smart Circadian Lid Included
            </span>
            <span className="edition-meta-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Hand-built to Order
            </span>
          </div>

          <div className="edition-price-row">
            <strong>${edition.price}</strong>
            <span>Tax included · Free white-glove local Los Angeles delivery or insured DIY kit</span>
          </div>

          <div className="edition-actions-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => addEditionToJar(edition)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}
            >
              <JarIcon />
              Add to Your Jar — ${edition.price}
            </button>
            <button
              type="button"
              className="secondary-outline-button"
              onClick={() => loadSignaturePreset(edition.presetKey)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              Customize in Studio <ArrowIcon />
            </button>
          </div>
        </div>

        <div className="edition-hero-visual">
          <div className="edition-photo-card">
            <img src={edition.image} alt={edition.name} />
            <div className="image-caption">
              <span>{edition.name}</span>
              <strong>{edition.vesselNote}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* PART 01: LIVING FLORA */}
      <section className="edition-detail-section">
        <div className="edition-section-header">
          <p className="eyebrow">Part 01 · Living Flora</p>
          <h2>The Botanical Canopy</h2>
          <p>
            Every specimen in {edition.name} is hand-selected from our greenhouse for humidity tolerance,
            harmonious root spread, and balanced micro-climatic transpiration under sealed glass.
          </p>
        </div>

        <div className="flora-grid">
          {edition.flora.map((item, idx) => (
            <article key={idx} className="flora-card">
              <span className="flora-card-tag">{item.role}</span>
              <h3>{item.name}</h3>
              <em className="flora-botanical">{item.botanical}</em>
              <p>{item.description}</p>
              <div className="flora-specs-strip">
                <span>
                  <strong>Target Humidity:</strong> {item.humidity}
                </span>
                <span>
                  <strong>Lighting Needs:</strong> {item.light}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PART 02: FOUNDATION & HARDSCAPE */}
      <section className="edition-detail-section alt-bg">
        <div className="edition-section-header">
          <p className="eyebrow">Part 02 · Foundation & Minerals</p>
          <h2>Stratified Earth Architecture</h2>
          <p>
            Beneath the living fronds lies an engineered geological column. Porous drainage stones catch excess dew,
            pure activated biochar filters impurities, and custom bark humus provides long-term nutrient reserves.
          </p>
        </div>

        <div className="elements-grid">
          {edition.elements.map((item, idx) => (
            <article key={idx} className="elements-card">
              <span className="flora-card-tag" style={{ background: "rgba(180, 132, 108, 0.2)", color: "#8a5340" }}>
                {item.category}
              </span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PART 03: INTEGRATED HARDWARE */}
      <section className="edition-detail-section">
        <div className="edition-section-header">
          <p className="eyebrow">Part 03 · Climate Engineering</p>
          <h2>Smart Circadian Lid Included Standard</h2>
          <p>
            Lighting, gentle air circulation, and ultrasonic fogging are all included with every TerraScape jar at no extra cost.
            Concealed quietly beneath the ceramic-finish lid, the hardware works in harmony with the plants.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.75rem",
          }}
        >
          <div
            style={{
              background: "var(--ts-parchment)",
              border: "1px solid var(--ts-border)",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ts-clay)",
                marginBottom: "0.6rem",
              }}
            >
              Standard · $0 Included
            </span>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>Circadian 5000K LED</h3>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ts-muted)" }}>
              Custom-calibrated full-spectrum diode ring provides optimal Photosynthetically Active Radiation (PAR)
              without generating trapped heat inside the glass.
            </p>
          </div>

          <div
            style={{
              background: "var(--ts-parchment)",
              border: "1px solid var(--ts-border)",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ts-clay)",
                marginBottom: "0.6rem",
              }}
            >
              Standard · $0 Included
            </span>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>113kHz Ultrasonic Mist</h3>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ts-muted)" }}>
              Piezo-ceramic atomizer converts pure distilled water into cold sub-micron fog particles that coat leaves
              just like high-altitude mountain dew.
            </p>
          </div>

          <div
            style={{
              background: "var(--ts-parchment)",
              border: "1px solid var(--ts-border)",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ts-clay)",
                marginBottom: "0.6rem",
              }}
            >
              Standard · $0 Included
            </span>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>Micro Air Circulation</h3>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ts-muted)" }}>
              A low-decibel micro blower circulates internal moisture pockets, balancing humidity gradients and keeping
              the viewing glass crystal clear.
            </p>
          </div>

          <div
            style={{
              background: "var(--ts-parchment)",
              border: "1px solid var(--ts-border)",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ts-clay)",
                marginBottom: "0.6rem",
              }}
            >
              Standard · $0 Included
            </span>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>USB-A Power Routing</h3>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ts-muted)" }}>
              Powered by a standard 5V braided linen USB-A cable that blends into desk and shelf settings without unsightly
              clutter.
            </p>
          </div>
        </div>
      </section>

      {/* PART 04: CARE & RITUALS */}
      <section className="edition-detail-section alt-bg">
        <div className="edition-section-header">
          <p className="eyebrow">Part 04 · TerraCare Rituals</p>
          <h2>Thoughtful, Effortless Care</h2>
          <p>
            Sealed botanical biospheres are remarkably self-sustaining. Follow these simple guidelines to keep your
            vessel vibrant for seasons to come.
          </p>
        </div>

        <div className="care-cards-grid">
          {edition.care.map((item, idx) => (
            <article key={idx} className="care-card">
              <small>{item.label}</small>
              <span className="care-schedule-pill">{item.schedule}</span>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BAND */}
      <section className="cta-band">
        <span>Curated & Assembled by Hand</span>
        <h2>
          Make {edition.name}
          <br />
          part of your space.
        </h2>
        <div style={{ display: "inline-flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
          <button
            type="button"
            className="light-button"
            onClick={() => addEditionToJar(edition)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}
          >
            <JarIcon />
            Add to Your Jar — ${edition.price}
          </button>
          <button
            type="button"
            className="secondary-outline-button"
            style={{ borderColor: "rgba(255, 255, 255, 0.4)", color: "#ffffff" }}
            onClick={() => loadSignaturePreset(edition.presetKey)}
          >
            Customize in Studio <ArrowIcon />
          </button>
        </div>
      </section>
    </div>
  );
}
