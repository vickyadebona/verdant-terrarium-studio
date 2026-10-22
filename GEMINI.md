# Project Context: TerraScape — Custom Terrariums & Smart Vivarium Hardware

## Repository & Owner
- **Developer:** Vicky Adebona (https://github.com/vickyadebona)
- **Hardware & Botanical Partner:** Andrew Hung (Mechanical Engineering, Custom PCB/Lighting & Ultrasonic Misting Circuits)

## Project Overview
TerraScape is an e-commerce platform and guided product configurator for custom-built botanical terrariums equipped with custom-engineered microclimate electronics (PWM circadian LED rings, active aeration fans, and ultrasonic piezo misting manifolds).

## Current Implementation Status
- **Guided Studio Wizard & Storefront:**
  - 4-step guided configurator (`Vessel` -> `Foundation` -> `Flora` -> `Details`) in `src/App.tsx`.
  - Step 3 Flora selection supports multi-select with no duplicate quantities by default, with an internal toggle component for 0-5 multiple quantities.
  - Dual visualizer: Architectural 2D procedural cross-section (`src/Terrarium2DLayeredView.tsx`) and interactive Three.js WebGL 3D showcase with OrbitControls and mist particles (`src/Terrarium3DShowcase.tsx`).
  - Warm parchment & cream botanical design system (`#18392b`, `#f8f5ee`, `#f0ede3`, `#657a4e`, `#b8c2a1`).
  - Curated 1-of-1 Signature Editions with dedicated showcase pages (`src/components/EditionDetailPage.tsx`).
  - Slide-over Cart Drawer (`src/components/CartDrawer.tsx`), Auth Modal (`src/components/AuthModal.tsx`), and In-App Stripe Payment Modal (`src/components/StripeCheckoutModal.tsx`).
  - 5-stage living vivarium assembly & quarantine tracker (`BLUEPRINT_RECEIVED` -> `CIRCUIT_SOLDERING` -> `PLANTING` -> `QUARANTINE` -> `SHIPPED`).
  - Synthesized Web Audio API procedural sound effects (`src/utils/soundEffects.ts`).

## Upcoming Engineering Roadmap
- **Phase 3 (Full-Stack E-Commerce & Database):**
  - Headless Next.js REST API service with Prisma ORM + PostgreSQL (`src/db/schema.txt`).
  - HTTP-only secure cookie authentication.
  - Stripe Hosted Checkout and `checkout.session.completed` webhook listeners.
  - Andrew Hung's protected `/admin` workbench for CAD blueprint inspection and quarantine logging.
