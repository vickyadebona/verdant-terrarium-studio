import React, { useRef, useState } from 'react';
import { Cpu } from 'lucide-react';
import type {
  BomSummary,
  HardwareId,
  LightingMode,
  PlacedItem,
  SubstrateLayer,
  VesselConfig,
} from '../types/terrarium';
import { CATALOG_ITEMS, HARDWARE_MODULES, SUBSTRATES } from '../data';
import { sfx } from '../utils/soundEffects';
import { ItemInspectorToolbar } from './ItemInspectorToolbar';

interface TerrariumCanvasProps {
  currentVessel: VesselConfig;
  substrates: SubstrateLayer[];
  items: PlacedItem[];
  equippedHardware: HardwareId[];
  lighting: LightingMode;
  isMisting: boolean;
  selectedUid: string | null;
  onSelectUid: (uid: string | null) => void;
  onUpdateItem: (uid: string, patch: Partial<PlacedItem>) => void;
  onDuplicateItem: (uid: string) => void;
  onDeleteItem: (uid: string) => void;
  bomSummary: BomSummary;
}

export const TerrariumCanvas: React.FC<TerrariumCanvasProps> = ({
  currentVessel,
  substrates,
  items,
  equippedHardware,
  lighting,
  isMisting,
  selectedUid,
  onSelectUid,
  onUpdateItem,
  onDuplicateItem,
  onDeleteItem,
  bomSummary,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingUid, setDraggingUid] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const selectedItem = items.find((i) => i.uid === selectedUid) || null;
  const fairyLightsActive = equippedHardware.includes('copper_fairy');

  // Accurate SVG Matrix Coordinate Conversion
  const getSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 200, y: 250 };

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }

    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 400,
      y: ((clientY - rect.top) / rect.height) * 500,
    };
  };

  const handleItemPointerDown = (e: React.PointerEvent, item: PlacedItem) => {
    e.stopPropagation();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // Ignore on unsupported synthetic touch
    }
    onSelectUid(item.uid);
    setDraggingUid(item.uid);
    const coords = getSvgCoords(e.clientX, e.clientY);
    setDragOffset({ dx: item.x - coords.x, dy: item.y - coords.y });
    sfx.playPop(1.05);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!draggingUid) return;
    const coords = getSvgCoords(e.clientX, e.clientY);
    const clampedX = Math.max(60, Math.min(340, coords.x + dragOffset.dx));
    const clampedY = Math.max(70, Math.min(435, coords.y + dragOffset.dy));
    onUpdateItem(draggingUid, { x: Math.round(clampedX), y: Math.round(clampedY) });
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (draggingUid) {
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingUid(null);
    }
  };

  // Pre-compute stacked substrate SVG paths from bottom (y=440) upward
  const renderedSubstrates = (() => {
    let currentY = 440;
    let prevControlY = 440;

    return substrates.map((layer) => {
      const cfg = SUBSTRATES.find((s) => s.id === layer.type) || SUBSTRATES[0];
      const nextY = Math.max(120, currentY - layer.depth);
      const nextControlY = nextY - layer.contour;

      const d = `M 30 ${currentY} Q 200 ${prevControlY} 370 ${currentY} L 370 ${nextY} Q 200 ${nextControlY} 30 ${nextY} Z`;

      const topSurfaceY = nextY;
      currentY = nextY;
      prevControlY = nextControlY;

      return {
        layer,
        cfg,
        d,
        topSurfaceY,
      };
    });
  })();

  // Ambient background classes based on lighting mode
  const stageBgClass =
    lighting === 'day'
      ? 'from-stone-900 via-emerald-950/80 to-stone-950'
      : lighting === 'golden'
      ? 'from-amber-950 via-stone-900 to-stone-950'
      : 'from-slate-950 via-indigo-950/90 to-black';

  return (
    <main
      className={`order-1 lg:order-2 flex-1 lg:col-span-8 xl:col-span-8 relative flex flex-col items-center justify-center p-2 sm:p-6 bg-gradient-to-b ${stageBgClass} transition-colors duration-700 min-h-[240px] overflow-hidden`}
      onPointerDown={() => onSelectUid(null)}
    >
      {/* Ambient Backlight Halo */}
      <div
        className={`absolute w-64 h-64 sm:w-[420px] sm:h-[420px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          lighting === 'day'
            ? 'bg-emerald-400/10'
            : lighting === 'golden'
            ? 'bg-amber-500/20'
            : 'bg-indigo-500/20'
        }`}
      />

      {/* Equipped Smart Hardware Status Badges on Stage */}
      {equippedHardware.length > 0 && !selectedItem && (
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[85%] pointer-events-none">
          {equippedHardware.map((hwId) => {
            const hw = HARDWARE_MODULES.find((h) => h.id === hwId);
            if (!hw) return null;
            return (
              <span
                key={hw.id}
                className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-stone-900/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shadow-md"
              >
                <Cpu className="w-3 h-3 text-emerald-400" />
                {hw.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Floating Inspector Toolbar when an item is selected */}
      {selectedItem && (
        <ItemInspectorToolbar
          selectedItem={selectedItem}
          onUpdateItem={onUpdateItem}
          onDuplicateItem={onDuplicateItem}
          onDeleteItem={onDeleteItem}
          onDeselect={() => onSelectUid(null)}
        />
      )}

      {/* Interactive SVG Terrarium Canvas */}
      <div className="relative w-full h-full max-w-[380px] sm:max-w-[450px] max-h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-full drop-shadow-2xl select-none touch-none"
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerUp}
        >
          <defs>
            {/* Dynamic Vessel Clip Path */}
            <clipPath id="vesselClip">
              <path d={currentVessel.clipPath} />
            </clipPath>

            {/* Bioluminescent Radial Glows */}
            <radialGradient id="biolumGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="amethystGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ledCone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  lighting === 'night'
                    ? '#818cf8'
                    : lighting === 'golden'
                    ? '#fb923c'
                    : '#fef08a'
                }
                stopOpacity="0.28"
              />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Wooden Tabletop Shadow */}
          <ellipse cx="200" cy="448" rx="145" ry="16" fill="rgba(0,0,0,0.55)" />

          {/* Optional Vessel Base */}
          {currentVessel.baseElement}

          {/* Back Glass Tint */}
          <path
            d={currentVessel.outlinePath}
            fill={
              lighting === 'night'
                ? 'rgba(15, 23, 42, 0.45)'
                : lighting === 'golden'
                ? 'rgba(251, 191, 36, 0.08)'
                : 'rgba(255, 255, 255, 0.06)'
            }
          />

          {/* CLIPPED INTERIOR: HARDWARE RAYS, SUBSTRATES, ITEMS, FAIRY LIGHTS, MIST */}
          <g clipPath="url(#vesselClip)">
            {/* Andrew's Circadian LED Light Cone Visual */}
            {equippedHardware.includes('circadian_led') && (
              <polygon points="145,55 255,55 345,420 55,420" fill="url(#ledCone)" />
            )}

            {/* Submersible Copper Fairy Lights String */}
            {fairyLightsActive && (
              <g>
                <path
                  d="M 70 120 Q 200 165 330 115 Q 210 210 85 195"
                  stroke="rgba(253, 224, 71, 0.4)"
                  strokeWidth="1.2"
                  fill="none"
                />
                {[
                  { x: 110, y: 132 },
                  { x: 165, y: 145 },
                  { x: 225, y: 142 },
                  { x: 285, y: 128 },
                  { x: 245, y: 175 },
                  { x: 180, y: 188 },
                  { x: 120, y: 192 },
                ].map((bulb, i) => (
                  <g key={i}>
                    <circle
                      cx={bulb.x}
                      cy={bulb.y}
                      r="10"
                      fill="url(#lanternGlow)"
                      opacity="0.7"
                    />
                    <circle cx={bulb.x} cy={bulb.y} r="3" fill="#fef08a" />
                  </g>
                ))}
              </g>
            )}

            {/* Rendered Substrate Layers */}
            {renderedSubstrates.map(({ layer, cfg, d }) => (
              <g key={layer.uid}>
                <path d={d} fill={cfg.colorTop} stroke={cfg.colorBottom} strokeWidth="1.5" />
              </g>
            ))}

            {/* Placed Botanicals & Hardscape (sorted by zIndex) */}
            {[...items]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((placed) => {
                const catItem = CATALOG_ITEMS.find((c) => c.id === placed.itemId);
                if (!catItem) return null;
                const isSelected = placed.uid === selectedUid;
                const flipScaleX = placed.flipX ? -placed.scale : placed.scale;

                return (
                  <g
                    key={placed.uid}
                    transform={`translate(${placed.x}, ${placed.y}) rotate(${placed.rotation}) scale(${flipScaleX}, ${placed.scale})`}
                    onPointerDown={(e) => handleItemPointerDown(e, placed)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {/* Invisible Generous Touch Target for Mobile Thumbs */}
                    <circle cx="0" cy="-22" r="32" fill="transparent" />

                    {/* Selection Ring */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="-24"
                        r="38"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth={2 / placed.scale}
                        strokeDasharray="4 4"
                      />
                    )}
                    {catItem.renderSvg(lighting === 'night')}
                  </g>
                );
              })}

            {/* Misting Particle Spray Overlay */}
            {isMisting && (
              <g className="animate-pulse pointer-events-none">
                {Array.from({ length: 36 }).map((_, idx) => {
                  const cx = 80 + ((idx * 47) % 240);
                  const cy = 95 + ((idx * 63) % 310);
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={(idx % 3) + 1.5}
                      fill="rgba(186, 230, 253, 0.65)"
                    />
                  );
                })}
              </g>
            )}
          </g>

          {/* Front Specular Glass Reflection & Vessel Outline */}
          <path
            d={currentVessel.outlinePath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="3.5"
            pointerEvents="none"
          />
          <path
            d={currentVessel.highlightPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="6"
            strokeLinecap="round"
            pointerEvents="none"
          />

          {/* Vessel Lid / Brass Frame Overlay */}
          <g pointerEvents="none">{currentVessel.lidElement}</g>
        </svg>
      </div>

      {/* Bottom Live BOM Summary Pill */}
      <div className="hidden sm:flex mt-1 items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-stone-400 bg-stone-900/80 px-4 py-1.5 rounded-full border border-stone-800">
        <div>
          Vessel: <strong className="text-stone-200">${bomSummary.vesselCost}</strong>
        </div>
        <div>
          Soil ({substrates.length}): <strong className="text-stone-200">${bomSummary.substrateCost}</strong>
        </div>
        <div>
          Specimens ({items.length}): <strong className="text-stone-200">${bomSummary.itemsCost}</strong>
        </div>
        <div>
          Smart Hardware ({equippedHardware.length}):{' '}
          <strong className="text-emerald-300">${bomSummary.hardwareCost}</strong>
        </div>
      </div>
    </main>
  );
};
