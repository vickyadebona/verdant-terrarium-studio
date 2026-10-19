// ============================================================================
// TerraScape × Gemini AI — Figma Plugin Main Thread (code.ts)
// ============================================================================

figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true,
  title: 'TerraScape × Gemini AI',
});

interface GeneratedSvgPayload {
  name: string;
  latinName: string;
  sku: string;
  category: 'flora' | 'hardscape';
  price: number;
  bioluminescent: boolean;
  svgCode: string;
}

interface GeneratedUiSpecCard {
  title: string;
  sku: string;
  subtitle: string;
  specs: string[];
  powerDraw: string;
  price: number;
  schematicSvg?: string;
}

interface GeneratedUiLayoutPayload {
  frameTitle: string;
  sectionSubtitle: string;
  accentHex: string;
  cards: GeneratedUiSpecCard[];
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim();
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  if (Number.isNaN(num)) {
    return { r: 0.06, g: 0.72, b: 0.5 };
  }
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

async function loadFonts() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
}

// Send stored API key to UI on startup
(async () => {
  const savedKey = await figma.clientStorage.getAsync('GEMINI_API_KEY');
  figma.ui.postMessage({ type: 'INIT_API_KEY', apiKey: savedKey || '' });
})();

// Listen for selection changes to keep the Export tab updated
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'SELECTION_CHANGED',
    count: selection.length,
    names: selection.map((n) => n.name),
  });
});

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'SAVE_API_KEY') {
      await figma.clientStorage.setAsync('GEMINI_API_KEY', msg.apiKey);
      figma.notify('Gemini API key saved to Figma local storage.');
      return;
    }

    // 1. Insert Generated Botanical / Hardscape SVG onto Canvas
    if (msg.type === 'INSERT_SVG') {
      await loadFonts();
      const data: GeneratedSvgPayload = msg.payload;

      const card = figma.createFrame();
      card.name = `${data.sku} — ${data.name}`;
      card.layoutMode = 'VERTICAL';
      card.primaryAxisSizingMode = 'AUTO';
      card.counterAxisSizingMode = 'AUTO';
      card.itemSpacing = 10;
      card.paddingTop = 16;
      card.paddingBottom = 16;
      card.paddingLeft = 16;
      card.paddingRight = 16;
      card.cornerRadius = 16;
      card.fills = [{ type: 'SOLID', color: hexToRgb('#1c1917') }];
      card.strokes = [{ type: 'SOLID', color: hexToRgb('#10b981'), opacity: 0.45 }];
      card.strokeWeight = 1;

      // Parse SVG into editable Figma vector nodes
      const svgNode = figma.createNodeFromSvg(data.svgCode);
      svgNode.name = `${data.name} Vector`;
      svgNode.resize(160, 160);
      card.appendChild(svgNode);

      // Title + SKU label
      const titleText = figma.createText();
      titleText.fontName = { family: 'Inter', style: 'Bold' };
      titleText.fontSize = 14;
      titleText.characters = `${data.name} (${data.sku})`;
      titleText.fills = [{ type: 'SOLID', color: hexToRgb('#f5f5f4') }];
      card.appendChild(titleText);

      // Latin & Price subtitle
      const subText = figma.createText();
      subText.fontName = { family: 'Inter', style: 'Regular' };
      subText.fontSize = 11;
      subText.characters = `${data.latinName} • $${data.price} • ${data.category.toUpperCase()}${
        data.bioluminescent ? ' • GLOWS' : ''
      }`;
      subText.fills = [{ type: 'SOLID', color: hexToRgb('#34d399') }];
      card.appendChild(subText);

      // Center in viewport
      const center = figma.viewport.center;
      card.x = Math.round(center.x - card.width / 2);
      card.y = Math.round(center.y - card.height / 2);

      figma.currentPage.appendChild(card);
      figma.currentPage.selection = [card];
      figma.viewport.scrollAndZoomIntoView([card]);
      figma.notify(`Inserted "${data.name}" onto Figma canvas!`);
      return;
    }

    // 2. Insert Generated Auto-Layout UI & Hardware Spec Frame onto Canvas
    if (msg.type === 'INSERT_UI_LAYOUT') {
      await loadFonts();
      const layout: GeneratedUiLayoutPayload = msg.payload;
      const accentColor = hexToRgb(layout.accentHex || '#10b981');

      const rootFrame = figma.createFrame();
      rootFrame.name = `TerraScape — ${layout.frameTitle}`;
      rootFrame.layoutMode = 'VERTICAL';
      rootFrame.primaryAxisSizingMode = 'AUTO';
      rootFrame.counterAxisSizingMode = 'AUTO';
      rootFrame.itemSpacing = 20;
      rootFrame.paddingTop = 32;
      rootFrame.paddingBottom = 32;
      rootFrame.paddingLeft = 32;
      rootFrame.paddingRight = 32;
      rootFrame.cornerRadius = 24;
      rootFrame.fills = [{ type: 'SOLID', color: hexToRgb('#0c0a09') }];
      rootFrame.strokes = [{ type: 'SOLID', color: accentColor, opacity: 0.4 }];
      rootFrame.strokeWeight = 1.5;

      // Header section
      const headerTitle = figma.createText();
      headerTitle.fontName = { family: 'Inter', style: 'Bold' };
      headerTitle.fontSize = 24;
      headerTitle.characters = layout.frameTitle;
      headerTitle.fills = [{ type: 'SOLID', color: hexToRgb('#fafaf9') }];
      rootFrame.appendChild(headerTitle);

      const headerSub = figma.createText();
      headerSub.fontName = { family: 'Inter', style: 'Regular' };
      headerSub.fontSize = 13;
      headerSub.characters = layout.sectionSubtitle;
      headerSub.fills = [{ type: 'SOLID', color: hexToRgb('#a8a29e') }];
      rootFrame.appendChild(headerSub);

      // Horizontal Auto-Layout Grid of Spec Cards
      const cardsRow = figma.createFrame();
      cardsRow.name = 'Cards Grid';
      cardsRow.layoutMode = 'HORIZONTAL';
      cardsRow.primaryAxisSizingMode = 'AUTO';
      cardsRow.counterAxisSizingMode = 'AUTO';
      cardsRow.itemSpacing = 16;
      cardsRow.fills = [];
      rootFrame.appendChild(cardsRow);

      for (const item of layout.cards) {
        const card = figma.createFrame();
        card.name = `${item.sku} — ${item.title}`;
        card.layoutMode = 'VERTICAL';
        card.primaryAxisSizingMode = 'AUTO';
        card.counterAxisSizingMode = 'FIXED';
        card.resize(280, 100);
        card.itemSpacing = 10;
        card.paddingTop = 20;
        card.paddingBottom = 20;
        card.paddingLeft = 20;
        card.paddingRight = 20;
        card.cornerRadius = 16;
        card.fills = [{ type: 'SOLID', color: hexToRgb('#1c1917') }];
        card.strokes = [{ type: 'SOLID', color: accentColor, opacity: 0.35 }];
        card.strokeWeight = 1;

        if (item.schematicSvg) {
          try {
            const schemNode = figma.createNodeFromSvg(item.schematicSvg);
            schemNode.name = `${item.sku} Schematic`;
            schemNode.resize(240, 110);
            card.appendChild(schemNode);
          } catch {
            // Skip invalid schematic SVG
          }
        }

        const skuBadge = figma.createText();
        skuBadge.fontName = { family: 'Inter', style: 'Medium' };
        skuBadge.fontSize = 11;
        skuBadge.characters = `${item.sku} • ${item.powerDraw} • $${item.price}`;
        skuBadge.fills = [{ type: 'SOLID', color: accentColor }];
        card.appendChild(skuBadge);

        const cardTitle = figma.createText();
        cardTitle.fontName = { family: 'Inter', style: 'Bold' };
        cardTitle.fontSize = 16;
        cardTitle.characters = item.title;
        cardTitle.fills = [{ type: 'SOLID', color: hexToRgb('#f5f5f4') }];
        cardTitle.layoutAlign = 'STRETCH';
        card.appendChild(cardTitle);

        const cardSub = figma.createText();
        cardSub.fontName = { family: 'Inter', style: 'Regular' };
        cardSub.fontSize = 12;
        cardSub.characters = item.subtitle;
        cardSub.fills = [{ type: 'SOLID', color: hexToRgb('#a8a29e') }];
        cardSub.layoutAlign = 'STRETCH';
        card.appendChild(cardSub);

        for (const specLine of item.specs) {
          const specText = figma.createText();
          specText.fontName = { family: 'Inter', style: 'Regular' };
          specText.fontSize = 11;
          specText.characters = `• ${specLine}`;
          specText.fills = [{ type: 'SOLID', color: hexToRgb('#d6d3d1') }];
          specText.layoutAlign = 'STRETCH';
          card.appendChild(specText);
        }

        cardsRow.appendChild(card);
      }

      const center = figma.viewport.center;
      rootFrame.x = Math.round(center.x - rootFrame.width / 2);
      rootFrame.y = Math.round(center.y - rootFrame.height / 2);

      figma.currentPage.appendChild(rootFrame);
      figma.currentPage.selection = [rootFrame];
      figma.viewport.scrollAndZoomIntoView([rootFrame]);
      figma.notify(`Generated "${layout.frameTitle}" layout on canvas!`);
      return;
    }

    // 3. Export Selected Figma Nodes to TerraScape Format
    if (msg.type === 'EXPORT_SELECTION') {
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('Select at least one vector, group, or frame on the Figma canvas first.', {
          error: true,
        });
        figma.ui.postMessage({ type: 'EXPORT_ERROR', message: 'No nodes selected in Figma.' });
        return;
      }

      const exportedItems = [];
      for (let i = 0; i < selection.length; i++) {
        const node = selection[i];
        const svgBytes = await node.exportAsync({ format: 'SVG' });
        const svgString = String.fromCharCode.apply(null, Array.from(svgBytes));

        // Normalize coordinates onto TerraScape's 400x500 SVG stage
        const normX = Math.max(60, Math.min(340, Math.round(200 + (i - (selection.length - 1) / 2) * 45)));
        const normY = 310;

        exportedItems.push({
          id: node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `specimen_${i + 1}`,
          name: node.name,
          width: Math.round(node.width),
          height: Math.round(node.height),
          x: normX,
          y: normY,
          svgString,
        });
      }

      figma.ui.postMessage({
        type: 'EXPORT_RESULT',
        items: exportedItems,
      });
      figma.notify(`Exported ${exportedItems.length} node(s) for TerraScape!`);
      return;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    figma.notify(`Error: ${message}`, { error: true });
    figma.ui.postMessage({ type: 'PLUGIN_ERROR', message });
  }
};
