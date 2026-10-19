# TerraScape × Gemini AI — Figma Integration Guide

This directory contains your custom **TerraScape × Gemini AI Designer** Figma plugin, alongside the global **Figma MCP Server** configuration for Antigravity.

---

## Part 1: Connect Figma to Antigravity (via MCP)

The global MCP config file has already been created at [`~/.gemini/config/mcp_config.json`](file:///Users/vickyadebona/.gemini/config/mcp_config.json).

### Steps to Activate:
1. Open Figma and go to **Settings → Security → Personal access tokens**.
2. Click **Generate new token** (grant read access to **File content** and **Dev resources**), and copy the token (`figd_...`).
3. Open [`~/.gemini/config/mcp_config.json`](file:///Users/vickyadebona/.gemini/config/mcp_config.json) and replace `YOUR_FIGMA_PERSONAL_ACCESS_TOKEN` with your token:
   ```json
   {
     "mcpServers": {
       "figma": {
         "command": "npx",
         "args": ["-y", "figma-developer-mcp", "--stdio"],
         "env": {
           "FIGMA_API_KEY": "figd_YOUR_ACTUAL_TOKEN_HERE"
         }
       }
     }
   }
   ```
4. In Antigravity, check **Additional Options (...) → MCP Servers** to verify `figma` is connected. You can then paste any Figma frame URL directly into chat and ask Antigravity to inspect or build it!

---

## Part 2: Load the Custom "TerraScape × Gemini AI" Plugin in Figma

The plugin in [`figma-plugin/`](./) is pre-compiled (`code.js` + `ui.html`) so you can load it directly into Figma Desktop with zero build step.

### Steps to Import into Figma Desktop:
1. Open the **Figma Desktop** app and open any design file.
2. In the top menu bar, go to **Plugins → Development → Import plugin from manifest...**
3. Select [`figma-plugin/manifest.json`](./manifest.json).
4. Run the plugin from **Plugins → Development → TerraScape × Gemini AI Designer**.
5. Paste your **Google AI Studio Gemini API Key** (`AIza...`) at the top of the plugin window and click **Save Key** (it is stored locally in Figma `clientStorage`).

### What You Can Do Inside the Plugin:
- **Tab 1 — Botanical & Hardscape SVG Generator:** Uses `gemini-3.8-flash` or `gemini-4-argon` with structured JSON output (`v1beta/interactions`) to generate multi-layered botanical specimens and hardscape vectors (`viewBox="-50 -70 100 85"`) and inserts them onto your Figma canvas as editable vector frames.
- **Tab 2 — UI & Schematics Generator:** Generates native Figma Auto-Layout frames and technical vector block diagrams for Phase 2 & 3 (*"Andrew's Signature Builds"*, *"Inside the Engineering"* PCB specs, and the *Order & Quarantine Tracker*).
- **Tab 3 — Export to Code (`TerrariumBuilder.tsx`):** Select any vector or frame on your Figma canvas and click **Export Selected SVG** to get a ready-to-paste `CatalogItem` snippet and 400×500 stage coordinates, or click **🪄 Gemini JSX + Night Mode** to automatically convert the Figma SVG into clean React JSX with `(isNight: boolean)` bioluminescence support.
