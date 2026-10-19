import type { VesselConfig } from '../types/terrarium';

export const VESSELS: VesselConfig[] = [
  {
    id: 'globe',
    sku: 'VSL-GLB-01',
    name: 'Classic Fishbowl Globe',
    subtitle: 'Open-top spherical glass bowl',
    price: 45,
    clipPath: 'M 110 70 C 30 120, 25 360, 115 440 L 285 440 C 375 360, 370 120, 290 70 Z',
    outlinePath: 'M 110 70 C 30 120, 25 360, 115 440 L 285 440 C 375 360, 370 120, 290 70 Z',
    highlightPath: 'M 120 90 C 55 135, 50 345, 125 425',
    lidElement: (
      <ellipse
        cx="200"
        cy="70"
        rx="90"
        ry="12"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2.5"
      />
    ),
  },
  {
    id: 'wardian',
    sku: 'VSL-WRD-02',
    name: 'Geometric Wardian Case',
    subtitle: 'Faceted brass-trimmed conservatory',
    price: 78,
    clipPath: 'M 135 55 L 265 55 L 350 170 L 315 440 L 85 440 L 50 170 Z',
    outlinePath: 'M 135 55 L 265 55 L 350 170 L 315 440 L 85 440 L 50 170 Z',
    highlightPath: 'M 140 70 L 68 175 L 98 420',
    lidElement: (
      <g stroke="#b48a4e" strokeWidth="2.5" fill="none" opacity="0.85">
        <path d="M 135 55 L 200 170 L 265 55" />
        <path d="M 50 170 L 350 170" />
        <path d="M 200 170 L 200 440" />
      </g>
    ),
  },
  {
    id: 'apothecary',
    sku: 'VSL-APT-03',
    name: 'Corked Apothecary Jar',
    subtitle: 'Sealed vintage vessel with natural cork',
    price: 62,
    clipPath:
      'M 145 55 L 255 55 L 255 95 C 325 115, 335 160, 335 230 L 335 415 C 335 432, 320 440, 295 440 L 105 440 C 80 440, 65 432, 65 415 L 65 230 C 65 160, 75 115, 145 95 Z',
    outlinePath:
      'M 145 55 L 255 55 L 255 95 C 325 115, 335 160, 335 230 L 335 415 C 335 432, 320 440, 295 440 L 105 440 C 80 440, 65 432, 65 415 L 65 230 C 65 160, 75 115, 145 95 Z',
    highlightPath: 'M 85 220 L 85 405',
    lidElement: (
      <g>
        <rect
          x="152"
          y="34"
          width="96"
          height="36"
          rx="6"
          fill="#b38354"
          stroke="#8c6239"
          strokeWidth="2"
        />
        <circle cx="170" cy="48" r="2" fill="#754c24" opacity="0.6" />
        <circle cx="215" cy="56" r="2.5" fill="#754c24" opacity="0.6" />
        <circle cx="230" cy="44" r="1.8" fill="#754c24" opacity="0.6" />
      </g>
    ),
  },
  {
    id: 'cloche',
    sku: 'VSL-CLC-04',
    name: 'Botanical Bell Cloche',
    subtitle: 'Domed glass bell on turned walnut base',
    price: 72,
    clipPath:
      'M 200 50 C 100 50, 75 150, 75 260 L 75 435 L 325 435 L 325 260 C 325 150, 300 50, 200 50 Z',
    outlinePath:
      'M 200 50 C 100 50, 75 150, 75 260 L 75 435 L 325 435 L 325 260 C 325 150, 300 50, 200 50 Z',
    highlightPath: 'M 190 68 C 115 75, 95 160, 95 260 L 95 415',
    lidElement: (
      <circle
        cx="200"
        cy="36"
        r="14"
        fill="rgba(255,255,255,0.22)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.5"
      />
    ),
    baseElement: (
      <g>
        <rect
          x="55"
          y="433"
          width="290"
          height="16"
          rx="6"
          fill="#5e3a24"
          stroke="#3d2314"
          strokeWidth="2"
        />
        <rect x="68" y="447" width="264" height="8" rx="3" fill="#422616" />
      </g>
    ),
  },
  {
    id: 'teardrop',
    sku: 'VSL-TRD-05',
    name: 'Sculptural Teardrop',
    subtitle: 'Suspended organic blown-glass vessel',
    price: 58,
    clipPath:
      'M 200 35 C 165 110, 55 225, 55 325 C 55 400, 120 442, 200 442 C 280 442, 345 400, 345 325 C 345 225, 235 110, 200 35 Z',
    outlinePath:
      'M 200 35 C 165 110, 55 225, 55 325 C 55 400, 120 442, 200 442 C 280 442, 345 400, 345 325 C 345 225, 235 110, 200 35 Z',
    highlightPath: 'M 185 85 C 145 150, 75 240, 75 325 C 75 375, 115 415, 165 425',
    lidElement: (
      <circle
        cx="200"
        cy="24"
        r="9"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2.5"
      />
    ),
  },
  {
    id: 'flask',
    sku: 'VSL-FLK-06',
    name: 'Alchemist Conical Flask',
    subtitle: 'Borosilicate Erlenmeyer laboratory vessel',
    price: 54,
    clipPath:
      'M 162 50 L 238 50 L 238 140 L 348 405 C 358 428, 342 440, 315 440 L 85 440 C 58 440, 42 428, 52 405 L 162 140 Z',
    outlinePath:
      'M 162 50 L 238 50 L 238 140 L 348 405 C 358 428, 342 440, 315 440 L 85 440 C 58 440, 42 428, 52 405 L 162 140 Z',
    highlightPath: 'M 172 150 L 75 395',
    lidElement: (
      <ellipse
        cx="200"
        cy="50"
        rx="40"
        ry="6"
        fill="rgba(255,255,255,0.18)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2.5"
      />
    ),
  },
];
