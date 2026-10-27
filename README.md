# 🌿 TerraScape — Living Terrariums & Smart Vivarium Studio

An interactive botanical terrarium studio and e-commerce platform built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Three.js WebGL**, and procedural **Web Audio APIs**.

🔗 **Developer:** [Vicky Adebona](https://github.com/vickyadebona)  
🔧 **Hardware & Botany Partner:** Andrew Hung

---

## ✨ Key Features

- **Guided Studio Wizard:** 4-step progressive configurator (**Vessel & Smart Lid** $\rightarrow$ **Stratified Foundation** $\rightarrow$ **Live Flora** $\rightarrow$ **Hardscape Details**).
- **Dual Visualizer Stage:** Procedural 2D cross-section architectural cutaway ([`Terrarium2DLayeredView.tsx`](./src/Terrarium2DLayeredView.tsx)) paired with an interactive 3D WebGL showcase with orbit controls and ultrasonic mist particles ([`Terrarium3DShowcase.tsx`](./src/Terrarium3DShowcase.tsx)).
- **Curated Signature Editions:** Ready-to-ship 1-of-1 vivariums with high-resolution photography, technical specs, and one-click cart additions.
- **Integrated Smart Climate Lid:** Circadian PWM lighting, active ventilation fan, and ultrasonic atomization manifold standard with every order.
- **Tamper-Resistant Pricing & Order Engine:** Authoritative server-style catalog recalculation against master SKUs before checkout.
- **5-Stage Living Assembly Tracker:** Tracks living vivariums through Andrew's actual workshop process (`BLUEPRINT_RECEIVED` $\rightarrow$ `CIRCUIT_SOLDERING` $\rightarrow$ `PLANTING` $\rightarrow$ `QUARANTINE` $\rightarrow$ `SHIPPED`).
- **Zero-Asset Web Audio:** Procedurally synthesized organic sound effects (pop sweeps, sand crunches, ultrasonic mist hiss) with zero audio file downloads.

---

## 🗂️ Architecture & Onboarding

For details on the modular architecture, data flows, and technical subsystems, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

```text
src/
├── app/                        # Next.js App Router: one folder per URL, plus layout, providers and not-found
├── site/                       # Page components, header/footer shell, Studio state, navigation hook
├── Terrarium2DLayeredView.tsx  # Procedural 2D cross-section SVG stage
├── Terrarium3DShowcase.tsx     # Three.js WebGL 3D showcase
├── context/                    # AuthContext & CartContext with local persistence
├── components/                 # CartDrawer, AuthModal, StripeCheckoutModal, OrderTrackerModal
├── catalog/                    # Single product catalog (integer cents), editions, delivery & Studio blueprint builder
└── utils/                      # URL aliases, Stripe checkout engine & Web Audio synthesizer
```

---

## 🚀 Getting Started

Requires **Node 22** (pinned in `.nvmrc`; run `nvm use`).

```bash
# Clone the repository
git clone https://github.com/vickyadebona/terrascape.git
cd terrascape

# Install dependencies & start the Next.js dev server (http://localhost:3000)
npm install
npm run dev
```

### Checks

These run in GitHub Actions (`.github/workflows/ci.yml`) on every push to `dev`, `staging` and `main`, and on pull requests.

| Command | What it does |
| --- | --- |
| `npm run lint` | oxlint (rules in `.oxlintrc.json`) |
| `npm run typecheck` | TypeScript in `strict` mode, app and tests |
| `npm test` | Vitest unit and component tests |
| `npm start` | Serve the production build locally |
| `npm run build` | Next.js production build (also typechecks) |
| `npm run test:e2e` | Playwright smoke tests against the dev server |
