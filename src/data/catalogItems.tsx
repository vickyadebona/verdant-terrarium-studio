import type { CatalogItem } from '../types/terrarium';

export const CATALOG_ITEMS: CatalogItem[] = [
  // FLORA
  {
    id: 'fern',
    sku: 'FLR-FRN',
    name: 'Boston Fern',
    latin: 'Nephrolepis exaltata',
    category: 'flora',
    price: 12,
    defaultScale: 1.05,
    renderSvg: () => (
      <g>
        <path d="M0,0 Q-28,-38 -52,-25" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0,0 Q-18,-55 -35,-65" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0,0 Q0,-65 5,-78" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0,0 Q20,-55 38,-62" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0,0 Q30,-35 54,-20" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
        {[-15, -30, -45, -60].map((y, idx) => (
          <g key={idx}>
            <ellipse
              cx={-idx * 6 - 6}
              cy={y}
              rx="7"
              ry="3.5"
              transform={`rotate(-25 ${-idx * 6 - 6} ${y})`}
              fill="#22c55e"
            />
            <ellipse
              cx={idx * 6 + 6}
              cy={y}
              rx="7"
              ry="3.5"
              transform={`rotate(25 ${idx * 6 + 6} ${y})`}
              fill="#22c55e"
            />
            <ellipse cx={2} cy={y - 8} rx="8" ry="3.5" transform={`rotate(10 2 ${y - 8})`} fill="#4ade80" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'echeveria',
    sku: 'FLR-ECH',
    name: 'Blue Echeveria',
    latin: 'Echeveria elegans',
    category: 'flora',
    price: 11,
    defaultScale: 1.0,
    renderSvg: () => (
      <g transform="translate(0, -15)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={`outer-${angle}`}
            cx="0"
            cy="-14"
            rx="10"
            ry="20"
            fill="#5eead4"
            stroke="#0f766e"
            strokeWidth="1.2"
            transform={`rotate(${angle})`}
          />
        ))}
        {[22, 67, 112, 157, 202, 247, 292, 337].map((angle) => (
          <ellipse
            key={`mid-${angle}`}
            cx="0"
            cy="-9"
            rx="7"
            ry="13"
            fill="#99f6e4"
            stroke="#0d9488"
            strokeWidth="1"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="6" fill="#ccfbf1" />
      </g>
    ),
  },
  {
    id: 'fittonia',
    sku: 'FLR-FIT',
    name: 'Pink Nerve Plant',
    latin: 'Fittonia albivenis',
    category: 'flora',
    price: 10,
    defaultScale: 1.0,
    renderSvg: () => (
      <g>
        {[
          { rot: -35, x: -18, y: -26 },
          { rot: 35, x: 18, y: -26 },
          { rot: -12, x: -6, y: -42 },
          { rot: 15, x: 8, y: -38 },
        ].map((leaf, i) => (
          <g key={i} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot})`}>
            <path
              d="M0,18 C-14,12 -16,-8 0,-18 C16,-8 14,12 0,18 Z"
              fill="#14532d"
              stroke="#f43f5e"
              strokeWidth="1.2"
            />
            <path
              d="M0,16 L0,-14 M0,4 L-8,-2 M0,4 L8,-2 M0,-4 L-6,-9 M0,-4 L6,-9"
              stroke="#fb7185"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'monstera',
    sku: 'FLR-MNS',
    name: 'Mini Monstera',
    latin: 'Rhaphidophora tetrasperma',
    category: 'flora',
    price: 16,
    defaultScale: 1.05,
    renderSvg: () => (
      <g>
        <path d="M0,0 Q-12,-25 -22,-42" stroke="#166534" strokeWidth="3" fill="none" />
        <path d="M0,0 Q10,-30 18,-52" stroke="#166534" strokeWidth="3" fill="none" />
        <g transform="translate(-22, -45) rotate(-22)">
          <path
            d="M0,20 C-18,15 -22,-5 -12,-12 L-4,-6 L-10,-16 C-4,-22 4,-22 10,-16 L4,-6 L12,-12 C22,-5 18,15 0,20 Z"
            fill="#15803d"
          />
          <path d="M0,18 L0,-16" stroke="#4ade80" strokeWidth="1.5" />
        </g>
        <g transform="translate(18, -55) rotate(18)">
          <path
            d="M0,22 C-20,16 -24,-5 -14,-14 L-5,-7 L-11,-18 C-4,-25 4,-25 11,-18 L5,-7 L14,-14 C24,-5 20,16 0,22 Z"
            fill="#22c55e"
          />
          <path d="M0,20 L0,-18" stroke="#86efac" strokeWidth="1.5" />
        </g>
      </g>
    ),
  },
  {
    id: 'tillandsia',
    sku: 'FLR-TIL',
    name: 'Silver Air Plant',
    latin: 'Tillandsia xerographica',
    category: 'flora',
    price: 14,
    defaultScale: 1.0,
    renderSvg: () => (
      <g>
        <path d="M0,0 C-15,-10 -38,-5 -46,12 C-32,-2 -12,-4 0,0 Z" fill="#94a3b8" />
        <path d="M0,0 C15,-10 38,-5 46,12 C32,-2 12,-4 0,0 Z" fill="#94a3b8" />
        <path d="M0,0 C-20,-28 -35,-42 -22,-56 C-25,-38 -10,-20 0,0 Z" fill="#cbd5e1" />
        <path d="M0,0 C20,-28 35,-42 22,-56 C25,-38 10,-20 0,0 Z" fill="#cbd5e1" />
        <path d="M0,0 C-8,-35 -5,-55 4,-65 C-2,-45 2,-22 0,0 Z" fill="#e2e8f0" />
      </g>
    ),
  },
  {
    id: 'cactus',
    sku: 'FLR-CAC',
    name: 'Golden Barrel Cactus',
    latin: 'Echinocactus grusonii',
    category: 'flora',
    price: 14,
    defaultScale: 1.0,
    renderSvg: () => (
      <g transform="translate(0, -24)">
        <ellipse cx="0" cy="0" rx="24" ry="25" fill="#15803d" stroke="#14532d" strokeWidth="2" />
        <path d="M-12,-22 C-16,0 -16,0 -12,22" stroke="#166534" strokeWidth="2" fill="none" />
        <path d="M0,-25 L0,25" stroke="#166534" strokeWidth="2" fill="none" />
        <path d="M12,-22 C16,0 16,0 12,22" stroke="#166534" strokeWidth="2" fill="none" />
        {[-12, 0, 12].map((x) =>
          [-12, 0, 12].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#fde047" />)
        )}
        <circle cx="0" cy="-24" r="5" fill="#f43f5e" />
      </g>
    ),
  },
  {
    id: 'amanita',
    sku: 'FLR-AMN',
    name: 'Amanita Toadstools',
    latin: 'Amanita muscaria',
    category: 'flora',
    price: 12,
    defaultScale: 1.0,
    renderSvg: () => (
      <g>
        <path d="M-8,0 L-5,-32 L5,-32 L8,0 Z" fill="#f5f5f4" />
        <path d="M-24,-30 C-24,-50 24,-50 24,-30 Z" fill="#dc2626" />
        <circle cx="-10" cy="-38" r="3" fill="#ffffff" />
        <circle cx="2" cy="-42" r="3.5" fill="#ffffff" />
        <circle cx="12" cy="-36" r="2.5" fill="#ffffff" />
        <path d="M12,0 L14,-18 L20,-18 L22,0 Z" fill="#e7e5e4" />
        <path d="M6,-17 C6,-29 28,-29 28,-17 Z" fill="#ef4444" />
        <circle cx="14" cy="-22" r="2" fill="#ffffff" />
        <circle cx="21" cy="-20" r="1.8" fill="#ffffff" />
      </g>
    ),
  },
  {
    id: 'mycena',
    sku: 'FLR-MYC',
    name: 'Bioluminescent Mycena',
    latin: 'Mycena chlorophos',
    category: 'flora',
    price: 18,
    bioluminescent: true,
    defaultScale: 1.05,
    renderSvg: (isNight) => (
      <g>
        {isNight && <circle cx="0" cy="-30" r="38" fill="url(#biolumGlow)" opacity="0.85" />}
        <path d="M0,0 Q-6,-18 -14,-34" stroke="#6ee7b7" strokeWidth="2.5" fill="none" />
        <path d="M0,0 Q2,-24 4,-44" stroke="#6ee7b7" strokeWidth="2.5" fill="none" />
        <path d="M0,0 Q10,-16 18,-28" stroke="#6ee7b7" strokeWidth="2.5" fill="none" />
        <path
          d="M-26,-32 C-26,-45 -2,-45 -2,-32 Z"
          fill={isNight ? '#34d399' : '#10b981'}
          stroke="#a7f3d0"
          strokeWidth="1.5"
        />
        <path
          d="M-10,-42 C-10,-58 18,-58 18,-42 Z"
          fill={isNight ? '#34d399' : '#10b981'}
          stroke="#a7f3d0"
          strokeWidth="1.5"
        />
        <path
          d="M8,-26 C8,-38 28,-38 28,-26 Z"
          fill={isNight ? '#34d399' : '#10b981'}
          stroke="#a7f3d0"
          strokeWidth="1.5"
        />
      </g>
    ),
  },
  {
    id: 'flytrap',
    sku: 'FLR-VFT',
    name: 'Venus Flytrap',
    latin: 'Dionaea muscipula',
    category: 'flora',
    price: 16,
    defaultScale: 1.0,
    renderSvg: () => (
      <g>
        <path d="M0,0 Q-16,-15 -24,-32" stroke="#15803d" strokeWidth="4" fill="none" />
        <path d="M0,0 Q14,-18 22,-36" stroke="#15803d" strokeWidth="4" fill="none" />
        <g transform="translate(-24, -34) rotate(-25)">
          <path d="M-14,0 C-14,-14 14,-14 14,0 Z" fill="#4ade80" stroke="#166534" strokeWidth="1.5" />
          <path d="M-11,-2 C-11,-9 11,-9 11,-2 Z" fill="#f43f5e" />
          <path
            d="M-12,-4 L-15,-9 M-6,-8 L-8,-13 M0,-9 L0,-15 M6,-8 L8,-13 M12,-4 L15,-9"
            stroke="#166534"
            strokeWidth="1.5"
          />
        </g>
        <g transform="translate(22, -38) rotate(20)">
          <path d="M-14,0 C-14,-14 14,-14 14,0 Z" fill="#4ade80" stroke="#166534" strokeWidth="1.5" />
          <path d="M-11,-2 C-11,-9 11,-9 11,-2 Z" fill="#f43f5e" />
          <path
            d="M-12,-4 L-15,-9 M-6,-8 L-8,-13 M0,-9 L0,-15 M6,-8 L8,-13 M12,-4 L15,-9"
            stroke="#166534"
            strokeWidth="1.5"
          />
        </g>
      </g>
    ),
  },
  {
    id: 'pearls',
    sku: 'FLR-SOP',
    name: 'String of Pearls',
    latin: 'Curio rowleyanus',
    category: 'flora',
    price: 13,
    defaultScale: 1.0,
    renderSvg: () => (
      <g>
        <path d="M0,0 Q-12,22 -16,52" stroke="#166534" strokeWidth="2" fill="none" />
        <path d="M0,0 Q4,28 2,62" stroke="#166534" strokeWidth="2" fill="none" />
        <path d="M0,0 Q16,20 22,46" stroke="#166534" strokeWidth="2" fill="none" />
        {[8, 20, 32, 44].map((y, idx) => (
          <g key={idx}>
            <circle cx={-idx * 3.5 - 3} cy={y} r="5.5" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
            <circle cx={2} cy={y + 6} r="6" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx={idx * 4 + 4} cy={y - 2} r="5.5" fill="#86efac" stroke="#15803d" strokeWidth="1" />
          </g>
        ))}
      </g>
    ),
  },

  // HARDSCAPE & ACCENTS
  {
    id: 'seiryu',
    sku: 'HRD-SRY',
    name: 'Seiryu Mountain Stone',
    latin: 'Blue-grey limestone crag',
    category: 'hardscape',
    price: 14,
    defaultScale: 1.1,
    renderSvg: () => (
      <g>
        <polygon points="-32,0 -22,-42 -4,-58 18,-48 34,0" fill="#475569" stroke="#1e293b" strokeWidth="2" />
        <polygon points="-4,-58 18,-48 34,0 2,0" fill="#334155" />
        <path
          d="M-18,-25 L-4,-38 L6,-20 M-8,-10 L12,-28"
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    ),
  },
  {
    id: 'driftwood',
    sku: 'HRD-DRF',
    name: 'Spider Driftwood',
    latin: 'Twisted azalea root branch',
    category: 'hardscape',
    price: 16,
    defaultScale: 1.1,
    renderSvg: () => (
      <g>
        <path
          d="M-28,0 C-15,-12 -8,-28 -35,-48 C-10,-34 0,-22 8,-58 C10,-28 22,-22 42,-36 C22,-15 12,-8 18,0 Z"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="1.8"
        />
      </g>
    ),
  },
  {
    id: 'amethyst',
    sku: 'HRD-AMT',
    name: 'Amethyst Geode Cluster',
    latin: 'Raw crystalline quartz',
    category: 'hardscape',
    price: 22,
    bioluminescent: true,
    defaultScale: 1.0,
    renderSvg: (isNight) => (
      <g>
        {isNight && <circle cx="0" cy="-24" r="34" fill="url(#amethystGlow)" opacity="0.75" />}
        <polygon points="-22,0 -28,-26 -14,-42 -4,0" fill="#9333ea" stroke="#581c87" strokeWidth="1.5" />
        <polygon points="-8,0 -10,-46 4,-58 12,0" fill="#a855f7" stroke="#581c87" strokeWidth="1.5" />
        <polygon points="6,0 14,-38 26,-24 20,0" fill="#c084fc" stroke="#581c87" strokeWidth="1.5" />
        <polygon points="-4,-44 4,-58 8,-30" fill="#e9d5ff" opacity="0.65" />
      </g>
    ),
  },
  {
    id: 'lantern',
    sku: 'HRD-LNT',
    name: 'Mossy Stone Lantern',
    latin: 'Miniature Toro garden shrine',
    category: 'hardscape',
    price: 15,
    bioluminescent: true,
    defaultScale: 1.0,
    renderSvg: (isNight) => (
      <g>
        {isNight && <circle cx="0" cy="-32" r="36" fill="url(#lanternGlow)" opacity="0.9" />}
        <rect x="-14" y="-8" width="28" height="8" rx="2" fill="#64748b" />
        <rect x="-8" y="-24" width="16" height="16" fill="#94a3b8" />
        <rect x="-10" y="-40" width="20" height="16" fill="#475569" />
        <rect x="-6" y="-36" width="12" height="10" rx="2" fill={isNight ? '#fde047' : '#fef08a'} />
        <polygon points="-22,-40 22,-40 0,-54" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
        <circle cx="0" cy="-56" r="3.5" fill="#475569" />
        <path d="M-16,-41 C-10,-46 -2,-45 4,-41 Z" fill="#4d7c0f" />
      </g>
    ),
  },
  {
    id: 'frog',
    sku: 'HRD-FRG',
    name: 'Red-Eyed Tree Frog',
    latin: 'Hand-painted resin figurine',
    category: 'hardscape',
    price: 9,
    defaultScale: 0.95,
    renderSvg: () => (
      <g transform="translate(0, -10)">
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
        <circle cx="-8" cy="-9" r="5" fill="#ef4444" stroke="#14532d" strokeWidth="1.5" />
        <circle cx="8" cy="-9" r="5" fill="#ef4444" stroke="#14532d" strokeWidth="1.5" />
        <ellipse cx="-8" cy="-9" rx="1.5" ry="3.5" fill="#000000" />
        <ellipse cx="8" cy="-9" rx="1.5" ry="3.5" fill="#000000" />
        <circle cx="-12" cy="8" r="3.5" fill="#f97316" />
        <circle cx="12" cy="8" r="3.5" fill="#f97316" />
      </g>
    ),
  },
  {
    id: 'snail',
    sku: 'HRD-SNL',
    name: 'Golden Mystery Snail',
    latin: 'Sculpted vivarium accent',
    category: 'hardscape',
    price: 8,
    defaultScale: 0.95,
    renderSvg: () => (
      <g>
        <path
          d="M-20,0 C-10,0 14,0 22,-6 C26,-9 24,-14 18,-10 C12,-6 -12,-6 -20,0 Z"
          fill="#fde68a"
          stroke="#b45309"
          strokeWidth="1.2"
        />
        <path d="M20,-9 L26,-18 M17,-8 L21,-17" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-2" cy="-14" r="12" fill="#d97706" stroke="#78350f" strokeWidth="1.8" />
        <path
          d="M-2,-14 m-6,0 a6,6 0 1,0 12,0 a4,4 0 1,0 -8,0"
          stroke="#fef3c7"
          strokeWidth="1.8"
          fill="none"
        />
      </g>
    ),
  },
];
