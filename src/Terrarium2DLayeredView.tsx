import type { SoilLayerSpec } from "./catalog";

export type { SoilLayerSpec };

export interface Terrarium2DLayeredViewProps {
  selectedIds: string[];
  soilLayers: SoilLayerSpec[];
  captionTitle?: string;
  captionPrice?: string;
}

export default function Terrarium2DLayeredView({
  selectedIds,
  soilLayers,
  captionTitle = "Your custom composition",
  captionPrice = "",
}: Terrarium2DLayeredViewProps) {
  const isRidged = selectedIds.includes("jar_ridged");
  const hasVolcanicWall = selectedIds.includes("volcanic");
  const hasLavaBoulders = selectedIds.includes("lava_rock");
  const hasWood = selectedIds.includes("wood");
  const hasStone = selectedIds.includes("stone");
  const fernCount = selectedIds.filter((id) => id === "fern").length;
  const fittoniaCount = selectedIds.filter((id) => id === "fittonia").length;
  const mossCount = selectedIds.filter((id) => id === "moss").length;
  const monsteraCount = selectedIds.filter((id) => id === "monstera").length;
  const selaginellaCount = selectedIds.filter((id) => id === "selaginella").length;
  const hasSpringtails = selectedIds.includes("springtails");

  // Lighting, fan & mist are included standard with every TerraScape vessel
  const lightOn = true;
  const mistOn = true;

  const jarBottomY = 496;
  const jarLeftX = 104;
  const jarRightX = 356;
  const jarWidth = jarRightX - jarLeftX;

  let currentBottomY = jarBottomY;
  const computedSoilRects = soilLayers.map((layer, index) => {
    const pxHeight = Math.max(12, Math.min(54, layer.depthMm * 0.95));
    const topY = currentBottomY - pxHeight;
    const bottomY = currentBottomY;
    currentBottomY = topY;
    return {
      ...layer,
      index,
      topY,
      bottomY,
      pxHeight,
    };
  });

  const horizonY =
    computedSoilRects.length > 0
      ? computedSoilRects[computedSoilRects.length - 1].topY
      : 410;

  return (
    <div className={`terrarium-showcase layered-2d-stage ${lightOn ? "light-active" : "light-dim"}`}>
      <div className="svg-2d-canvas-wrap">
        <svg
          viewBox="0 0 460 540"
          className="terrarium-2d-svg"
          role="img"
          aria-label="Illustrated preview of your custom terrarium"
        >
          <defs>
            <clipPath id="apothecary-jar-clip">
              <path d="M 122 146 C 107 156, 104 176, 104 205 L 104 452 C 104 482, 126 496, 166 496 L 294 496 C 334 496, 356 482, 356 452 L 356 205 C 356 176, 353 156, 338 146 Z" />
            </clipPath>

            <radialGradient id="canopy-led-glow" cx="50%" cy="22%" r="65%">
              <stop offset="0%" stopColor="#FFE49E" stopOpacity="0.58" />
              <stop offset="45%" stopColor="#F5D076" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F0EDE3" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="glass-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
              <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="82%" stopColor="#18392B" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.28" />
            </linearGradient>

            <linearGradient id="white-polymer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EAE6DF" />
              <stop offset="30%" stopColor="#F9F7F2" />
              <stop offset="72%" stopColor="#ECE9E2" />
              <stop offset="100%" stopColor="#D8D4CB" />
            </linearGradient>

            {/* Soft Gaussian Blur for Realistic Fog Plume */}
            <filter id="soft-fog-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Subtle Ambient Halo Behind Jar */}
          <ellipse
            cx="230"
            cy="315"
            rx="156"
            ry="190"
            fill={lightOn ? "url(#canopy-led-glow)" : "rgba(184, 194, 161, 0.14)"}
          />

          {/* ==================== INTERIOR OF TALL APOTHECARY JAR (CLIPPED) ==================== */}
          <g clipPath="url(#apothecary-jar-clip)">
            <rect
              x="100"
              y="140"
              width="260"
              height="360"
              fill={lightOn ? "#F7F4EA" : "#ECEAE2"}
              opacity="0.72"
            />

            {lightOn && (
              <polygon
                points="175,165 285,165 356,496 104,496"
                fill="url(#canopy-led-glow)"
              />
            )}

            {/* PLANE 1: VOLCANIC LAVA-ROCK BACKWALL & BOULDERS */}
            {(hasVolcanicWall || hasLavaBoulders) && (
              <g className="layer-volcanic-wall">
                {hasVolcanicWall && (
                  <>
                    <path
                      d="M 168 425 C 162 365, 175 295, 192 235 C 204 195, 224 182, 248 185 C 276 188, 294 218, 304 268 C 316 325, 322 375, 318 428 Z"
                      fill="#2B2927"
                      stroke="#1F1D1B"
                      strokeWidth="2"
                    />
                    {[
                      { cx: 234, cy: 215, rx: 32, ry: 24, fill: "#383532" },
                      { cx: 212, cy: 254, rx: 35, ry: 26, fill: "#2D2A28" },
                      { cx: 258, cy: 262, rx: 34, ry: 27, fill: "#3D3936" },
                      { cx: 202, cy: 306, rx: 38, ry: 28, fill: "#262422" },
                      { cx: 252, cy: 312, rx: 40, ry: 30, fill: "#35322F" },
                      { cx: 282, cy: 348, rx: 32, ry: 26, fill: "#2C2927" },
                      { cx: 196, cy: 358, rx: 36, ry: 28, fill: "#3A3633" },
                      { cx: 242, cy: 368, rx: 42, ry: 30, fill: "#282624" },
                    ].map((rock, i) => (
                      <g key={i}>
                        <ellipse
                          cx={rock.cx}
                          cy={rock.cy}
                          rx={rock.rx}
                          ry={rock.ry}
                          fill={rock.fill}
                          stroke="#1D1B1A"
                          strokeWidth="1.5"
                        />
                        <circle cx={rock.cx - 8} cy={rock.cy - 5} r="2.2" fill="#181615" opacity="0.7" />
                        <circle cx={rock.cx + 10} cy={rock.cy + 4} r="1.8" fill="#181615" opacity="0.7" />
                        <circle cx={rock.cx + 2} cy={rock.cy - 9} r="1.5" fill="#4A4542" opacity="0.6" />
                      </g>
                    ))}
                  </>
                )}

                {hasLavaBoulders && (
                  <g className="layer-lava-boulders">
                    <path
                      d="M 268 415 L 284 368 L 318 362 L 336 392 L 328 422 Z"
                      fill="#3A3633"
                      stroke="#22201E"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M 294 372 L 314 366 L 324 388 L 298 394 Z"
                      fill="#4C4743"
                    />
                  </g>
                )}
              </g>
            )}

            {/* PLANE 2: SCULPTURAL MOPANI HARDWOOD SPINE */}
            {hasWood && (
              <g className="layer-mopani-wood">
                <path
                  d="M 136 418 C 168 378, 206 332, 256 266 C 272 245, 286 226, 298 214"
                  stroke="#6E472B"
                  strokeWidth="13"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 140 416 C 172 376, 208 330, 258 266"
                  stroke="#8C5E3C"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 208 334 C 192 304, 174 284, 158 272"
                  stroke="#6E472B"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* PLANE 3: MIDGROUND — BUTTON & MAIDENHAIR FERN (Multi-Quantity) */}
            {fernCount > 0 &&
              [
                { x: 156, y: horizonY + 4, scale: 1, flip: 1 },
                { x: 242, y: horizonY - 2, scale: 0.84, flip: -1 },
                { x: 194, y: horizonY - 12, scale: 0.72, flip: 1 },
              ]
                .slice(0, fernCount)
                .map((pos, cIdx) => (
                  <g
                    key={`fern-${cIdx}`}
                    className="layer-fern"
                    transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale * pos.flip}, ${pos.scale})`}
                  >
                    {[
                      { path: "M0,0 Q-34,-46 -62,-32" },
                      { path: "M0,0 Q-22,-68 -44,-82" },
                      { path: "M0,0 Q-4,-82 4,-98" },
                      { path: "M0,0 Q20,-66 42,-76" },
                      { path: "M0,0 Q34,-42 58,-24" },
                    ].map((frond, fIdx) => (
                      <path
                        key={fIdx}
                        d={frond.path}
                        stroke="#2E5A3B"
                        strokeWidth="2.6"
                        fill="none"
                        strokeLinecap="round"
                      />
                    ))}
                    {[-18, -34, -50, -66, -80].map((y, idx) => (
                      <g key={idx}>
                        <ellipse
                          cx={-idx * 6 - 7}
                          cy={y}
                          rx="8.5"
                          ry="4"
                          transform={`rotate(-24 ${-idx * 6 - 7} ${y})`}
                          fill="#4D7C4D"
                        />
                        <ellipse
                          cx={idx * 5 + 6}
                          cy={y}
                          rx="8.5"
                          ry="4"
                          transform={`rotate(24 ${idx * 5 + 6} ${y})`}
                          fill="#657A4E"
                        />
                        <ellipse
                          cx={1}
                          cy={y - 7}
                          rx="8"
                          ry="3.6"
                          transform={`rotate(8 1 ${y - 7})`}
                          fill="#7E9960"
                        />
                      </g>
                    ))}
                  </g>
                ))}

            {/* PLANE 4: UPPER MIDGROUND — MINIATURE EPIPHYTE VINE (Multi-Quantity) */}
            {monsteraCount > 0 &&
              [
                { x: 274, y: horizonY - 46, scale: 1, flip: 1 },
                { x: 184, y: horizonY - 62, scale: 0.85, flip: -1 },
                { x: 232, y: horizonY - 88, scale: 0.76, flip: 1 },
              ]
                .slice(0, monsteraCount)
                .map((pos, cIdx) => (
                  <g
                    key={`monstera-${cIdx}`}
                    className="layer-monstera"
                    transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale * pos.flip}, ${pos.scale})`}
                  >
                    <path d="M0,45 Q-14,12 -28,-18" stroke="#234F32" strokeWidth="3" fill="none" />
                    <path d="M0,45 Q14,8 26,-24" stroke="#234F32" strokeWidth="3" fill="none" />
                    {/* Centre stem carrying the top leaf at (-4, -38) */}
                    <path d="M0,45 Q5,2 -4,-38" stroke="#234F32" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                    {[
                      { x: -28, y: -18, r: -22 },
                      { x: 26, y: -24, r: 18 },
                      { x: -4, y: -38, r: -4 },
                      { x: 14, y: 4, r: 14 },
                    ].map((leaf, idx) => (
                      <g key={idx} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.r})`}>
                        <path
                          d="M0,0 C-18,-8 -22,-32 0,-42 C22,-32 18,-8 0,0 Z"
                          fill="#2E6F40"
                          stroke="#18392B"
                          strokeWidth="1.2"
                        />
                        <circle cx="-6" cy="-22" r="2.6" fill="#EBE7DEC0" />
                        <circle cx="6" cy="-16" r="2.4" fill="#EBE7DEC0" />
                        <line x1="0" y1="-3" x2="0" y2="-36" stroke="#76A878" strokeWidth="1.2" />
                      </g>
                    ))}
                  </g>
                ))}

            {/* PLANE 5: MIDGROUND CREVICE — SELAGINELLA CLUBMOSS (Multi-Quantity) */}
            {selaginellaCount > 0 &&
              [
                { x: 212, y: horizonY - 8, scale: 1 },
                { x: 148, y: horizonY - 4, scale: 0.85 },
                { x: 298, y: horizonY - 6, scale: 0.82 },
              ]
                .slice(0, selaginellaCount)
                .map((pos, cIdx) => (
                  <g
                    key={`selaginella-${cIdx}`}
                    className="layer-selaginella"
                    transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale})`}
                  >
                    {[-28, -14, 0, 14, 28].map((offsetX, i) => (
                      <g key={i} transform={`translate(${offsetX}, ${Math.abs(offsetX) * 0.25})`}>
                        <path
                          d="M0,12 Q-8,-12 -14,-24 M0,12 Q0,-16 2,-28 M0,12 Q8,-12 15,-22"
                          stroke="#588157"
                          strokeWidth="2.2"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <circle cx="-10" cy="-18" r="4.5" fill="#84A98C" />
                        <circle cx="2" cy="-22" r="5" fill="#749C75" />
                        <circle cx="11" cy="-16" r="4.5" fill="#A3B18A" />
                      </g>
                    ))}
                  </g>
                ))}

            {/* PLANE 6: FOREGROUND — FITTONIA NERVE TRIO (Multi-Quantity) */}
            {fittoniaCount > 0 &&
              [
                { x: 282, y: horizonY + 8, scale: 1, vein: "#D96B70" },
                { x: 186, y: horizonY + 10, scale: 0.86, vein: "#E8A598" },
                { x: 236, y: horizonY + 12, scale: 0.78, vein: "#F3D5CE" },
              ]
                .slice(0, fittoniaCount)
                .map((pos, cIdx) => (
                  <g
                    key={`fittonia-${cIdx}`}
                    className="layer-fittonia"
                    transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale})`}
                  >
                    {[
                      { rot: -34, scale: 1.05 },
                      { rot: -8, scale: 1.15 },
                      { rot: 22, scale: 1.05 },
                      { rot: 46, scale: 0.92 },
                    ].map((lf, idx) => (
                      <g key={idx} transform={`rotate(${lf.rot}) scale(${lf.scale})`}>
                        <path
                          d="M0,0 C-15,-12 -18,-36 0,-48 C18,-36 15,-12 0,0 Z"
                          fill="#1E4631"
                          stroke="#132E20"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M0,-3 L0,-43 M0,-14 L-8,-22 M0,-23 L-10,-32 M0,-32 L-6,-39 M0,-14 L8,-22 M0,-23 L10,-32 M0,-32 L6,-39"
                          stroke={pos.vein}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </g>
                    ))}
                  </g>
                ))}

            {/* PLANE 7: FOREGROUND FLOOR — CLOUD CUSHION MOSS MOUNDS (Multi-Quantity) */}
            {mossCount > 0 && (
              <g className="layer-cushion-moss">
                <path
                  d={`M 106 ${horizonY + 12} C 122 ${horizonY - 16}, 168 ${horizonY - 18}, 196 ${horizonY + 8} Z`}
                  fill="#5F7D46"
                  stroke="#3E562B"
                  strokeWidth="1.5"
                />
                <path
                  d={`M 178 ${horizonY + 14} C 202 ${horizonY - 12}, 254 ${horizonY - 14}, 278 ${horizonY + 12} Z`}
                  fill="#718F54"
                  stroke="#4A6434"
                  strokeWidth="1.5"
                />
                <path
                  d={`M 264 ${horizonY + 14} C 288 ${horizonY - 14}, 334 ${horizonY - 12}, 354 ${horizonY + 12} Z`}
                  fill="#55723E"
                  stroke="#3B5228"
                  strokeWidth="1.5"
                />
                {mossCount >= 2 && (
                  <>
                    <path
                      d={`M 134 ${horizonY + 4} C 152 ${horizonY - 24}, 198 ${horizonY - 22}, 218 ${horizonY + 4} Z`}
                      fill="#6C8C50"
                      stroke="#466030"
                      strokeWidth="1.4"
                    />
                    <path
                      d={`M 232 ${horizonY + 6} C 254 ${horizonY - 22}, 302 ${horizonY - 20}, 322 ${horizonY + 6} Z`}
                      fill="#7D9B5E"
                      stroke="#4E6837"
                      strokeWidth="1.4"
                    />
                  </>
                )}
                {mossCount >= 3 && (
                  <path
                    d={`M 186 ${horizonY - 2} C 208 ${horizonY - 30}, 256 ${horizonY - 28}, 276 ${horizonY - 2} Z`}
                    fill="#88A668"
                    stroke="#536E3B"
                    strokeWidth="1.4"
                  />
                )}
              </g>
            )}

            {/* PLANE 8: FOREGROUND ACCENT — WILLAMETTE RIVER STONES */}
            {hasStone && (
              <g className="layer-river-stones" transform={`translate(148, ${horizonY + 10})`}>
                <ellipse cx="0" cy="0" rx="22" ry="11" fill="#8D8A83" stroke="#5C5A55" strokeWidth="1.4" />
                <ellipse cx="26" cy="4" rx="15" ry="8.5" fill="#A6A29A" stroke="#6E6B65" strokeWidth="1.3" />
                <ellipse cx="-18" cy="5" rx="12" ry="6.5" fill="#75726C" stroke="#4F4D49" strokeWidth="1.2" />
              </g>
            )}

            {/* STACKED SUBSTRATE FOUNDATION LAYERS */}
            {computedSoilRects.map((layer) => {
              const wave = layer.contour * 1.4;
              const midX = jarLeftX + jarWidth / 2;
              const pathD = `
                M ${jarLeftX} ${layer.topY}
                Q ${midX} ${layer.topY - wave} ${jarRightX} ${layer.topY}
                L ${jarRightX} ${layer.bottomY + 14}
                L ${jarLeftX} ${layer.bottomY + 14}
                Z
              `;
              return (
                <g key={layer.id} className="soil-layer-group">
                  <path
                    d={pathD}
                    fill={layer.colorTop}
                    stroke={layer.colorBottom}
                    strokeWidth="1.2"
                  />
                  {[0.18, 0.34, 0.5, 0.66, 0.82].map((ratio, idx) => (
                    <circle
                      key={idx}
                      cx={jarLeftX + jarWidth * ratio}
                      cy={(layer.topY + layer.bottomY) / 2 + ((idx % 2) * 4 - 2)}
                      r={layer.id === "leca" ? 4.2 : layer.id === "charcoal" ? 2.2 : 2.8}
                      fill={layer.accentColor}
                      opacity="0.55"
                    />
                  ))}
                </g>
              );
            })}

            {hasSpringtails && (
              <g className="layer-springtails">
                {[142, 178, 215, 248, 286, 312].map((sx, idx) => (
                  <ellipse
                    key={idx}
                    cx={sx}
                    cy={horizonY + 26 + (idx % 3) * 6}
                    rx="2.4"
                    ry="1.1"
                    fill="#FFFDF9"
                    opacity="0.9"
                  />
                ))}
              </g>
            )}

            {/* SOFT GAUSSIAN VAPOR FOG PLUME */}
            {mistOn && (
              <g className="svg-mist-plume" filter="url(#soft-fog-blur)" opacity="0.68">
                <ellipse cx="230" cy="215" rx="64" ry="26" fill="#F2FAF6" />
                <ellipse cx="212" cy="260" rx="88" ry="34" fill="#EDF7F2" opacity="0.8" />
                <ellipse cx="246" cy="305" rx="105" ry="42" fill="#E8F4EE" opacity="0.6" />
              </g>
            )}
          </g>

          {/* GLASS VESSEL OUTLINE & HIGHLIGHTS */}
          <path
            d="M 122 146 C 107 156, 104 176, 104 205 L 104 452 C 104 482, 126 496, 166 496 L 294 496 C 334 496, 356 482, 356 452 L 356 205 C 356 176, 353 156, 338 146"
            fill="url(#glass-sheen)"
            stroke="#18392B"
            strokeOpacity="0.28"
            strokeWidth="2.5"
          />
          <path
            d="M 116 185 L 116 442"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* ¾-WIDTH UNDER-LID UNIT */}
          <g className="svg-tech-unit">
            <rect
              x="138"
              y="136"
              width="184"
              height="30"
              rx="8"
              fill="url(#white-polymer)"
              stroke="#C5C0B7"
              strokeWidth="1.5"
            />
            <path
              d="M 196 166 L 196 196 C 196 203, 264 203, 264 196 L 264 166 Z"
              fill="url(#white-polymer)"
              stroke="#C5C0B7"
              strokeWidth="1.5"
            />
            <rect
              x="154"
              y="163"
              width="152"
              height="4.5"
              rx="2.2"
              fill={lightOn ? "#FFB74D" : "#B8B3AA"}
            />
          </g>

          {/* THICK WHITE CIRCULAR LID (Smooth Default or Soft Helical Ridged) */}
          <g className="svg-top-lid">
            {/* White USB-A Power Cable */}
            <path
              d="M 344 96 C 388 94, 418 132, 428 212"
              stroke="#C5C0B7"
              strokeWidth="7.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 344 96 C 388 94, 418 132, 428 212"
              stroke="#F5F3EE"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <rect
              x="132"
              y="74"
              width="196"
              height="12"
              rx="5"
              fill="#F7F5F0"
              stroke="#C9C4BB"
              strokeWidth="1.4"
            />
            <rect x="218" y="69" width="24" height="5.5" rx="2.5" fill="#FFFFFF" stroke="#C2BDB4" strokeWidth="1.2" />
            <circle cx="176" cy="80" r="2.8" fill={lightOn || mistOn ? "#657A4E" : "#C9C4BB"} />
            <circle cx="230" cy="80" r="2.8" fill={lightOn ? "#D98A3C" : "#C9C4BB"} />
            <circle cx="284" cy="80" r="2.8" fill={mistOn ? "#4FA3A5" : "#C9C4BB"} />

            <rect
              x="106"
              y="84"
              width="248"
              height="54"
              rx="12"
              fill="url(#white-polymer)"
              stroke="#C2BDB4"
              strokeWidth="1.6"
            />

            {isRidged && (
              <g className="svg-helical-ridges" opacity="0.42">
                {[126, 152, 178, 204, 230, 256, 282, 308, 334].map((xStart, idx) => (
                  <g key={idx}>
                    <line
                      x1={xStart - 9}
                      y1={86}
                      x2={xStart + 11}
                      y2={136}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1={xStart - 6}
                      y1={86}
                      x2={xStart + 14}
                      y2={136}
                      stroke="#DFDBD2"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>

      <div className="image-caption">
        <span>{captionTitle}</span>
        <strong>{captionPrice}</strong>
      </div>
    </div>
  );
}
