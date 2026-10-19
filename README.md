# 🌿 TerraScape — Interactive Terrarium Builder & Purchasing Platform

An interactive, mobile-friendly botanical terrarium designer built with **React**, **TypeScript**, **Tailwind CSS**, and **SVG/Web Audio APIs**.

🔗 **Author:** [Vicky Adebona](https://github.com/vickyadebona)

## ✨ Features

- **6 Hand-Crafted Glass Vessels**: Choose between the *Classic Fishbowl Globe*, *Geometric Wardian Case*, *Corked Apothecary Jar*, *Botanical Bell Cloche*, *Sculptural Teardrop*, and *Alchemist Conical Flask*.
- **Dynamic Substrate Layering**: Stack up to 6 soil & drainage layers (*River Gravel*, *Expanded Clay LECA*, *Activated Charcoal*, *Tropical Humus*, *Silica Quartz Sand*, and *Live Cushion Moss*) with real-time depth and wave-slope sliders.
- **Interactive Botanicals & Hardscape**: Plant and arrange 16+ SVG specimens including *Boston Ferns*, *Blue Echeveria*, *Pink Nerve Plants*, *Mini Monstera*, *Bioluminescent Mycena*, *Venus Flytraps*, *Seiryu Stones*, *Amethyst Geodes*, and vivarium fauna.
- **Direct Canvas Manipulation**: Drag, scale, rotate, flip horizontally, layer forward/backward, duplicate, or remove specimens using accurate SVG matrix coordinate mapping (`getScreenCTM`).
- **Micro-Climate & Lighting Modes**: Switch between **Daylight**, **Golden Hour**, and **Night Bioluminescence**, toggle **Fairy Lights**, and mist your terrarium with procedural sound effects via the Web Audio API.
- **Responsive Mobile & Desktop UI**: Features a collapsible bottom-sheet tray on mobile (`100dvh`) and a studio split-pane layout on desktop.

## 🗂️ Codebase Architecture & Onboarding

For a complete breakdown of the modular file structure, component hierarchy, SVG coordinate math, and instructions on adding new plants, vessels, or hardware modules, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

```text
src/
├── TerrariumBuilder.tsx         # Top-level state orchestrator
├── types/terrarium.ts           # Shared TypeScript interfaces & types
├── data/                        # Vessels, substrates, flora/hardscape SVG catalogs, hardware & presets
├── utils/                       # Web Audio synthesizer & BOM pricing / JSON blueprint serializer
└── components/                  # Modular UI components (TopNavBar, TerrariumCanvas, BuilderDrawer, BlueprintModal, tabs/)
```

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/vickyadebona/terrascape.git
cd terrascape
```

### 2. Install dependencies & start dev server
```bash
npm install
npm run dev
```
