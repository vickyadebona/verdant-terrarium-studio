# Project Context: TerraScape — Custom Terrariums & Smart Vivarium Hardware

## Repository & Owner
- **Developer:** Vicky Adebona (https://github.com/vickyadebona)
- **Hardware & Botanical Partner:** Andrew Hung (Mechanical Engineering, Custom PCB/Lighting & Ultrasonic Misting Circuits)

## Project Overview
TerraScape is an interactive 2D SVG product configurator and e-commerce platform for custom-built botanical terrariums equipped with custom-engineered micro-climate electronics (PWM circadian LED rings, ultrasonic piezo misting manifolds, and closed-loop I2C humidity controllers).

## Current Implementation Status (Completed)
- **Phase 1 Complete (`src/TerrariumBuilder.tsx`):**
  - Interactive React + TypeScript + Tailwind CSS configurator with 6 glass vessels, 6 dynamic wave-contoured substrate layers, 16+ botanical/hardscape SVG items, and 4 smart hardware circuit modules.
  - Mobile-friendly split-screen layout (`100dvh`) with a collapsible bottom sheet drawer and accurate SVG matrix coordinate dragging (`getScreenCTM`).
  - Synthesized Web Audio API sound effects (zero external audio assets).
  - Live Bill-of-Materials (BOM) pricing engine and a Blueprint Spec Sheet / Checkout modal that serializes the exact coordinates, substrates, and hardware SKUs into JSON.

## Upcoming Engineering Roadmap (For Antigravity Agent)
- **Phase 2 (Brand & Showcase Gallery):**
  - Add a multi-page or tabbed view featuring **"Andrew's Signature Builds"** (ready-to-ship 1-of-1 terrariums with photography, circuit schematics, and a *"Load in Studio"* button).
  - Add an interactive **"Inside the Engineering"** section explaining the PWM lighting and ultrasonic misting hardware.
- **Phase 3 (Full-Stack E-Commerce, Database & Shipping):**
  - Migrate or connect to Next.js App Router / Payload CMS + PostgreSQL (Prisma/Drizzle).
  - Implement server-side BOM price validation and Stripe Checkout webhook integration (`checkout.session.completed`).
  - Build a custom multi-stage Order & Assembly Tracker (`BLUEPRINT_RECEIVED` -> `CIRCUIT_SOLDERING` -> `PLANTING` -> `QUARANTINE` -> `SHIPPED` via Shippo/EasyPost API).
