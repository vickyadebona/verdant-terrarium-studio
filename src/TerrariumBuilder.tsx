import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  Layers,
  Flower2,
  Mountain,
  Box,
  Shuffle,
  Lightbulb,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  X,
  Cpu,
  ShoppingBag,
  Check,
  FileCode2,
  Download,
  Wrench,
  Truck,
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

type VesselId = 'globe' | 'wardian' | 'apothecary' | 'cloche' | 'teardrop' | 'flask';
type SubstrateId = 'gravel' | 'leca' | 'charcoal' | 'humus' | 'sand' | 'moss';
type HardwareId = 'circadian_led' | 'ultrasonic_mist' | 'hygro_controller' | 'copper_fairy';
type ItemCategory = 'flora' | 'hardscape';
type LightingMode = 'day' | 'golden' | 'night';
type ActiveTab = 'vessels' | 'substrates' | 'flora' | 'hardscape' | 'hardware';
type FulfillmentType = 'assembled_local' | 'diy_kit_shipped';

interface VesselConfig {
  id: VesselId;
  sku: string;
  name: string;
  subtitle: string;
  price: number;
  clipPath: string;
  outlinePath: string;
  highlightPath: string;
  lidElement?: React.ReactNode;
  baseElement?: React.ReactNode;
}

interface SubstrateConfig {
  id: SubstrateId;
  sku: string;
  name: string;
  role: string;
  pricePerLayer: number;
  colorTop: string;
  colorBottom: string;
  accentColor: string;
  patternType: 'pebbles' | 'spheres' | 'specks' | 'fibers' | 'fine' | 'moss';
}

interface SubstrateLayer {
  uid: string;
  type: SubstrateId;
  depth: number; // 15 to 90
  contour: number; // -25 to 25
}

interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  latin: string;
  category: ItemCategory;
  price: number;
  bioluminescent?: boolean;
  defaultScale: number;
  renderSvg: (isNight: boolean) => React.ReactNode;
}

interface HardwareModule {
  id: HardwareId;
  sku: string;
  name: string;
  specs: string;
  description: string;
  price: number;
  powerDraw: string;
}

interface PlacedItem {
  uid: string;
  itemId: string;
  x: number; // SVG coordinate 50 to 350
  y: number; // SVG coordinate 60 to 440
  scale: number;
  rotation: number;
  flipX: boolean;
  zIndex: number;
}

// ==========================================
// WEB AUDIO SYNTHESIZER (Zero External Assets)
// ==========================================

class SoundEffects {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop(pitchMultiplier = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(580 * pitchMultiplier, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playSand() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  playMist() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }
}

const sfx = new SoundEffects();

// ==========================================
// DATA CATALOGS (Vessels, Substrates, Hardware, Items)
// ==========================================

const VESSELS: VesselConfig[] = [
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

const SUBSTRATES: SubstrateConfig[] = [
  {
    id: 'gravel',
    sku: 'SUB-GRV',
    name: 'River Gravel',
    role: 'False Bottom Drainage',
    pricePerLayer: 5,
    colorTop: '#9ca3af',
    colorBottom: '#6b7280',
    accentColor: '#d1d5db',
    patternType: 'pebbles',
  },
  {
    id: 'leca',
    sku: 'SUB-LEC',
    name: 'Expanded Clay (LECA)',
    role: 'Aeration & Moisture Reservoir',
    pricePerLayer: 6,
    colorTop: '#b45309',
    colorBottom: '#78350f',
    accentColor: '#d97706',
    patternType: 'spheres',
  },
  {
    id: 'charcoal',
    sku: 'SUB-CHR',
    name: 'Activated Charcoal',
    role: 'Toxin & Odor Filtration',
    pricePerLayer: 7,
    colorTop: '#27272a',
    colorBottom: '#18181b',
    accentColor: '#52525b',
    patternType: 'specks',
  },
  {
    id: 'humus',
    sku: 'SUB-HUM',
    name: 'Tropical ABG Humus',
    role: 'Nutrient-Rich Bio Substrate',
    pricePerLayer: 8,
    colorTop: '#452719',
    colorBottom: '#2d180e',
    accentColor: '#6b3e26',
    patternType: 'fibers',
  },
  {
    id: 'sand',
    sku: 'SUB-SND',
    name: 'Silica Quartz Sand',
    role: 'Decorative Sculpting Layer',
    pricePerLayer: 5,
    colorTop: '#e6ccb2',
    colorBottom: '#ddb892',
    accentColor: '#f5ebe0',
    patternType: 'fine',
  },
  {
    id: 'moss',
    sku: 'SUB-MOS',
    name: 'Live Cushion Moss',
    role: 'Top Moisture Lock & Carpet',
    pricePerLayer: 10,
    colorTop: '#4d7c0f',
    colorBottom: '#365314',
    accentColor: '#84cc16',
    patternType: 'moss',
  },
];

// ANDREW'S CUSTOM HARDWARE & CIRCUIT MODULES
const HARDWARE_MODULES: HardwareModule[] = [
  {
    id: 'circadian_led',
    sku: 'HW-LED-PWM1',
    name: 'Circadian PWM Grow-LED Ring',
    specs: 'Custom PCB • 2700K–6500K + 395nm UV • USB-C 5V',
    description:
      'Custom-machined lid ring with programmable sunrise, midday, golden hour, and night bioluminescence spectrums.',
    price: 48,
    powerDraw: '4.5W PWM',
  },
  {
    id: 'ultrasonic_mist',
    sku: 'HW-MST-PZO2',
    name: 'Ultrasonic Piezo Mist Atomizer',
    specs: '113kHz Piezo Transducer • 80mL Hidden Reservoir',
    description:
      'Micro-engineered misting manifold integrated into the vessel top that generates ultra-fine cloud fog on schedule.',
    price: 64,
    powerDraw: '2.0W 5V',
  },
  {
    id: 'hygro_controller',
    sku: 'HW-SEN-SHT4',
    name: 'Closed-Loop Climate Controller',
    specs: 'Sensirion SHT40 I2C Sensor + Micro Brushless Fan',
    description:
      'Monitors internal relative humidity & temperature in real time, automatically cycling airflow to prevent glass condensation.',
    price: 52,
    powerDraw: '0.8W Logic',
  },
  {
    id: 'copper_fairy',
    sku: 'HW-LGT-CPR3',
    name: 'Submersible Warm Copper Micro-LEDs',
    specs: 'IP67 Coated Copper Wire • Warm 2200K',
    description:
      'Delicate waterproof firefly filament woven through branches and hardscape for ambient nighttime glow.',
    price: 18,
    powerDraw: '0.5W Low-V',
  },
];

const CATALOG_ITEMS: CatalogItem[] = [
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

// ==========================================
// PRESET ECOSYSTEMS
// ==========================================

interface EcosystemPreset {
  name: string;
  vessel: VesselId;
  lighting: LightingMode;
  hardware: HardwareId[];
  substrates: SubstrateLayer[];
  items: PlacedItem[];
}

const PRESETS: Record<string, EcosystemPreset> = {
  rainforest: {
    name: 'Smart Cloud Rainforest',
    vessel: 'wardian',
    lighting: 'day',
    hardware: ['circadian_led', 'ultrasonic_mist', 'hygro_controller'],
    substrates: [
      { uid: 's1', type: 'leca', depth: 28, contour: 4 },
      { uid: 's2', type: 'charcoal', depth: 18, contour: -5 },
      { uid: 's3', type: 'humus', depth: 46, contour: 8 },
      { uid: 's4', type: 'moss', depth: 24, contour: -10 },
    ],
    items: [
      { uid: 'i1', itemId: 'driftwood', x: 210, y: 318, scale: 1.35, rotation: -8, flipX: false, zIndex: 1 },
      { uid: 'i2', itemId: 'fern', x: 145, y: 325, scale: 1.25, rotation: -12, flipX: false, zIndex: 2 },
      { uid: 'i3', itemId: 'monstera', x: 255, y: 320, scale: 1.2, rotation: 8, flipX: false, zIndex: 3 },
      { uid: 'i4', itemId: 'fittonia', x: 195, y: 340, scale: 1.05, rotation: 0, flipX: false, zIndex: 4 },
      { uid: 'i5', itemId: 'frog', x: 235, y: 270, scale: 0.9, rotation: -10, flipX: true, zIndex: 5 },
    ],
  },
  desert: {
    name: 'Sonoran Desert',
    vessel: 'globe',
    lighting: 'golden',
    hardware: ['circadian_led'],
    substrates: [
      { uid: 's1', type: 'gravel', depth: 32, contour: -6 },
      { uid: 's2', type: 'sand', depth: 58, contour: 16 },
    ],
    items: [
      { uid: 'i1', itemId: 'seiryu', x: 245, y: 350, scale: 1.35, rotation: 4, flipX: false, zIndex: 1 },
      { uid: 'i2', itemId: 'cactus', x: 155, y: 355, scale: 1.15, rotation: -5, flipX: false, zIndex: 2 },
      { uid: 'i3', itemId: 'echeveria', x: 215, y: 365, scale: 1.05, rotation: 12, flipX: false, zIndex: 3 },
      { uid: 'i4', itemId: 'tillandsia', x: 275, y: 345, scale: 0.95, rotation: 18, flipX: false, zIndex: 4 },
    ],
  },
  hollow: {
    name: 'Bioluminescent Hollow',
    vessel: 'cloche',
    lighting: 'night',
    hardware: ['circadian_led', 'copper_fairy', 'ultrasonic_mist'],
    substrates: [
      { uid: 's1', type: 'gravel', depth: 25, contour: 0 },
      { uid: 's2', type: 'charcoal', depth: 20, contour: 6 },
      { uid: 's3', type: 'humus', depth: 42, contour: -8 },
      { uid: 's4', type: 'moss', depth: 28, contour: 14 },
    ],
    items: [
      { uid: 'i1', itemId: 'amethyst', x: 145, y: 320, scale: 1.25, rotation: -10, flipX: false, zIndex: 1 },
      { uid: 'i2', itemId: 'lantern', x: 245, y: 322, scale: 1.1, rotation: 4, flipX: false, zIndex: 2 },
      { uid: 'i3', itemId: 'mycena', x: 195, y: 332, scale: 1.25, rotation: 0, flipX: false, zIndex: 3 },
      { uid: 'i4', itemId: 'amanita', x: 150, y: 342, scale: 1.0, rotation: 8, flipX: false, zIndex: 4 },
      { uid: 'i5', itemId: 'snail', x: 230, y: 348, scale: 0.9, rotation: -5, flipX: true, zIndex: 5 },
    ],
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function TerrariumBuilder() {
  // Core Terrarium State
  const [vesselId, setVesselId] = useState<VesselId>('wardian');
  const [substrates, setSubstrates] = useState<SubstrateLayer[]>(PRESETS.rainforest.substrates);
  const [items, setItems] = useState<PlacedItem[]>(PRESETS.rainforest.items);
  const [equippedHardware, setEquippedHardware] = useState<HardwareId[]>(PRESETS.rainforest.hardware);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // Environment & UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('hardware');
  const [lighting, setLighting] = useState<LightingMode>('day');
  const [isMisting, setIsMisting] = useState<boolean>(false);
  const [humidity, setHumidity] = useState<number>(76);
  const [muted, setMuted] = useState<boolean>(false);

  // Checkout / Blueprint Spec Modal State
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('assembled_local');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Mobile-Specific UI State
  const [mobileDrawerMinimized, setMobileDrawerMinimized] = useState<boolean>(false);
  const [showMobilePresets, setShowMobilePresets] = useState<boolean>(false);

  // Dragging State
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingUid, setDraggingUid] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const currentVessel = VESSELS.find((v) => v.id === vesselId) || VESSELS[0];
  const selectedItem = items.find((i) => i.uid === selectedUid) || null;
  const fairyLightsActive = equippedHardware.includes('copper_fairy');

  // ==========================================
  // LIVE BILL OF MATERIALS (BOM) PRICING ENGINE
  // ==========================================
  const bomSummary = useMemo(() => {
    const vesselCost = currentVessel.price;
    const substrateCost = substrates.reduce((sum, layer) => {
      const cfg = SUBSTRATES.find((s) => s.id === layer.type);
      return sum + (cfg ? cfg.pricePerLayer : 5);
    }, 0);
    const itemsCost = items.reduce((sum, placed) => {
      const cat = CATALOG_ITEMS.find((c) => c.id === placed.itemId);
      return sum + (cat ? cat.price : 10);
    }, 0);
    const hardwareCost = equippedHardware.reduce((sum, hwId) => {
      const hw = HARDWARE_MODULES.find((h) => h.id === hwId);
      return sum + (hw ? hw.price : 0);
    }, 0);

    const assemblyFee = fulfillmentType === 'assembled_local' ? 25 : 0;
    const total = vesselCost + substrateCost + itemsCost + hardwareCost + assemblyFee;

    return {
      vesselCost,
      substrateCost,
      itemsCost,
      hardwareCost,
      assemblyFee,
      total,
    };
  }, [currentVessel, substrates, items, equippedHardware, fulfillmentType]);

  // Toggle Hardware Module
  const toggleHardware = (hwId: HardwareId) => {
    sfx.playPop(1.2);
    setEquippedHardware((prev) =>
      prev.includes(hwId) ? prev.filter((id) => id !== hwId) : [...prev, hwId]
    );
  };

  // Toggle sound mute
  const toggleMute = () => {
    sfx.muted = !muted;
    setMuted(!muted);
  };

  // Trigger misting spray animation
  const triggerMist = () => {
    sfx.playMist();
    setIsMisting(true);
    setHumidity((h) => Math.min(99, h + 8));
    setTimeout(() => setIsMisting(false), 1800);
  };

  // Load a curated preset
  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    sfx.playPop(1.1);
    setVesselId(preset.vessel);
    setLighting(preset.lighting);
    setEquippedHardware(preset.hardware);
    setSubstrates(preset.substrates.map((s) => ({ ...s, uid: `${s.uid}-${Date.now()}` })));
    setItems(preset.items.map((i) => ({ ...i, uid: `${i.uid}-${Date.now()}` })));
    setSelectedUid(null);
    setShowMobilePresets(false);
  };

  // Randomize ecosystem
  const randomizeTerrarium = () => {
    sfx.playPop(1.25);
    const randomVessel = VESSELS[Math.floor(Math.random() * VESSELS.length)];
    setVesselId(randomVessel.id);

    const randomSubstrates: SubstrateLayer[] = [
      { uid: `sub-1-${Date.now()}`, type: 'gravel', depth: 25, contour: -8 },
      { uid: `sub-2-${Date.now()}`, type: 'humus', depth: 45, contour: 12 },
      { uid: `sub-3-${Date.now()}`, type: 'moss', depth: 25, contour: -6 },
    ];
    setSubstrates(randomSubstrates);

    const shuffled = [...CATALOG_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 5);
    const newItems: PlacedItem[] = shuffled.map((cat, idx) => ({
      uid: `rnd-${idx}-${Date.now()}`,
      itemId: cat.id,
      x: 130 + idx * 35 + Math.round(Math.random() * 20 - 10),
      y: 315 + Math.round(Math.random() * 30 - 15),
      scale: +(cat.defaultScale * (0.9 + Math.random() * 0.3)).toFixed(2),
      rotation: Math.round(Math.random() * 24 - 12),
      flipX: Math.random() > 0.5,
      zIndex: idx + 1,
    }));
    setItems(newItems);
    setSelectedUid(null);
    setShowMobilePresets(false);
  };

  // Add a substrate layer
  const addSubstrateLayer = (type: SubstrateId) => {
    if (substrates.length >= 6) return;
    sfx.playSand();
    setSubstrates((prev) => [
      ...prev,
      {
        uid: `sub-${Date.now()}-${Math.random()}`,
        type,
        depth: 28,
        contour: Math.round(Math.random() * 20 - 10),
      },
    ]);
  };

  // Update a substrate layer
  const updateSubstrate = (uid: string, patch: Partial<SubstrateLayer>) => {
    setSubstrates((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));
  };

  // Reorder substrate layer
  const moveSubstrate = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= substrates.length) return;
    sfx.playSand();
    const copy = [...substrates];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setSubstrates(copy);
  };

  // Delete substrate layer
  const removeSubstrate = (uid: string) => {
    sfx.playSand();
    setSubstrates((prev) => prev.filter((s) => s.uid !== uid));
  };

  // Calculate top surface Y of substrate stack so new items plant naturally on top
  const getTopSubstrateY = useCallback(() => {
    const totalDepth = substrates.reduce((acc, s) => acc + s.depth, 0);
    return Math.max(180, 440 - totalDepth + 12);
  }, [substrates]);

  // Add a botanical or hardscape item
  const addItem = (catItem: CatalogItem) => {
    sfx.playPop(1.0);
    const uid = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const maxZ = items.reduce((max, i) => Math.max(max, i.zIndex), 0);
    const newItem: PlacedItem = {
      uid,
      itemId: catItem.id,
      x: 200 + Math.round(Math.random() * 44 - 22),
      y: getTopSubstrateY(),
      scale: catItem.defaultScale,
      rotation: 0,
      flipX: false,
      zIndex: maxZ + 1,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedUid(uid);
  };

  // Update placed item properties
  const updateItem = (uid: string, patch: Partial<PlacedItem>) => {
    setItems((prev) => prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
  };

  // Duplicate selected item
  const duplicateItem = (uid: string) => {
    const orig = items.find((i) => i.uid === uid);
    if (!orig) return;
    sfx.playPop(1.15);
    const maxZ = items.reduce((max, i) => Math.max(max, i.zIndex), 0);
    const copy: PlacedItem = {
      ...orig,
      uid: `item-${Date.now()}`,
      x: Math.min(320, orig.x + 22),
      y: orig.y + 6,
      zIndex: maxZ + 1,
    };
    setItems((prev) => [...prev, copy]);
    setSelectedUid(copy.uid);
  };

  // Delete item
  const deleteItem = (uid: string) => {
    sfx.playPop(0.75);
    setItems((prev) => prev.filter((i) => i.uid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };

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
    setSelectedUid(item.uid);
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
    updateItem(draggingUid, { x: Math.round(clampedX), y: Math.round(clampedY) });
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

  // Keyboard shortcuts for selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedUid) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteItem(selectedUid);
      } else if (e.key === 'Escape') {
        setSelectedUid(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUid]);

  // Serialize Blueprint JSON for Andrew's Order / Fulfillment Engine
  const serializedBlueprint = useMemo(() => {
    return {
      blueprintVersion: '1.0.0',
      createdAt: new Date().toISOString(),
      fulfillmentType,
      estimatedTotalUSD: bomSummary.total,
      vessel: {
        id: currentVessel.id,
        sku: currentVessel.sku,
        name: currentVessel.name,
        price: currentVessel.price,
      },
      hardwareModules: equippedHardware.map((id) => {
        const hw = HARDWARE_MODULES.find((h) => h.id === id)!;
        return { id: hw.id, sku: hw.sku, name: hw.name, price: hw.price };
      }),
      substrateStackBottomToTop: substrates.map((s, idx) => {
        const cfg = SUBSTRATES.find((sub) => sub.id === s.type)!;
        return {
          layerOrder: idx + 1,
          sku: cfg.sku,
          name: cfg.name,
          depthMm: s.depth,
          slopeWave: s.contour,
          price: cfg.pricePerLayer,
        };
      }),
      specimens: items.map((i) => {
        const cat = CATALOG_ITEMS.find((c) => c.id === i.itemId)!;
        return {
          sku: cat.sku,
          name: cat.name,
          coordinates: { x: i.x, y: i.y },
          scale: i.scale,
          rotationDeg: i.rotation,
          flippedHorizontally: i.flipX,
          zIndex: i.zIndex,
          price: cat.price,
        };
      }),
    };
  }, [currentVessel, equippedHardware, substrates, items, fulfillmentType, bomSummary.total]);

  const copyBlueprintToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(serializedBlueprint, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const downloadBlueprintJson = () => {
    const blob = new Blob([JSON.stringify(serializedBlueprint, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verdant-blueprint-${currentVessel.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="h-[100dvh] w-full bg-stone-950 text-stone-100 flex flex-col font-sans select-none overflow-hidden">
      {/* ========================================== */}
      {/* TOP NAVIGATION & AMBIENCE BAR              */}
      {/* ========================================== */}
      <header className="shrink-0 border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 z-30">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-stone-100 flex items-center gap-2">
              <span className="truncate">Verdant Studio</span>
              <span className="hidden md:inline-block text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Custom Terrariums &amp; Smart Hardware
              </span>
            </h1>
            <p className="hidden sm:block text-xs text-stone-400 truncate">
              Design your botanical layout &amp; equip custom-engineered lighting/misting circuits
            </p>
          </div>
        </div>

        {/* Desktop Preset Ecosystems */}
        <div className="hidden 2xl:flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-stone-400 mr-1">Presets:</span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700/80 transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={randomizeTerrarium}
            title="Randomize Terrarium"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 border border-emerald-700/60 flex items-center gap-1 transition cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise</span>
          </button>
        </div>

        {/* Lighting, Micro-Climate & Order Blueprint CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Presets Toggle Button */}
          <button
            onClick={() => setShowMobilePresets((v) => !v)}
            className={`2xl:hidden px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              showMobilePresets
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-stone-800/90 border-stone-700 text-stone-300'
            }`}
            title="Presets & Randomizer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Lighting Switcher */}
          <div className="flex items-center bg-stone-800/90 p-0.5 sm:p-1 rounded-xl border border-stone-700/70">
            <button
              onClick={() => setLighting('day')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                lighting === 'day'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Daylight Spectrum"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Day</span>
            </button>
            <button
              onClick={() => setLighting('golden')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                lighting === 'golden'
                  ? 'bg-orange-500/25 text-orange-300 border border-orange-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Golden Hour PWM Dimming"
            >
              <Sunset className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Golden</span>
            </button>
            <button
              onClick={() => setLighting('night')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                lighting === 'night'
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Night UV Bioluminescence"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Night</span>
            </button>
          </div>

          <button
            onClick={triggerMist}
            className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Test Ultrasonic Piezo Mist"
          >
            <CloudRain className="w-4 h-4" />
            <span className="hidden sm:inline">{humidity}%</span>
          </button>

          <button
            onClick={toggleMute}
            className="hidden sm:flex p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 transition cursor-pointer"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Primary Review & Order Custom Build CTA */}
          <button
            onClick={() => {
              sfx.playPop(1.3);
              setIsBlueprintModalOpen(true);
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Review Build</span>
            <span className="px-1.5 py-0.5 rounded-md bg-stone-950/20 text-stone-950 font-bold">
              ${bomSummary.total}
            </span>
          </button>
        </div>
      </header>

      {/* Collapsible Mobile / Tablet Presets Bar */}
      {showMobilePresets && (
        <div className="2xl:hidden shrink-0 bg-stone-900/95 border-b border-stone-800 px-3 py-2 flex items-center gap-2 overflow-x-auto z-20">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 shrink-0">
            Presets:
          </span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 shrink-0"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={randomizeTerrarium}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 flex items-center gap-1 shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        </div>
      )}

      {/* ========================================== */}
      {/* MAIN WORKSPACE (Responsive Split View)     */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-hidden relative">
        {/* ========================================== */}
        {/* INTERACTIVE TERRARIUM STAGE                */}
        {/* ========================================== */}
        <main
          className={`order-1 lg:order-2 flex-1 lg:col-span-8 xl:col-span-8 relative flex flex-col items-center justify-center p-2 sm:p-6 bg-gradient-to-b ${stageBgClass} transition-colors duration-700 min-h-[240px] overflow-hidden`}
          onPointerDown={() => setSelectedUid(null)}
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
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute top-2 sm:top-4 z-30 max-w-[94vw] overflow-x-auto flex items-center gap-1 bg-stone-900/95 backdrop-blur-md border border-stone-700/90 px-2.5 py-1.5 rounded-2xl shadow-2xl"
            >
              <span className="text-[11px] sm:text-xs font-medium text-emerald-300 pr-2 border-r border-stone-700 whitespace-nowrap">
                {CATALOG_ITEMS.find((c) => c.id === selectedItem.itemId)?.name}
              </span>

              <button
                onClick={() =>
                  updateItem(selectedItem.uid, {
                    scale: Math.min(2.2, +(selectedItem.scale + 0.12).toFixed(2)),
                  })
                }
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Scale Up"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  updateItem(selectedItem.uid, {
                    scale: Math.max(0.45, +(selectedItem.scale - 0.12).toFixed(2)),
                  })
                }
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Scale Down"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  updateItem(selectedItem.uid, { rotation: selectedItem.rotation - 12 })
                }
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Rotate Left"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  updateItem(selectedItem.uid, { rotation: selectedItem.rotation + 12 })
                }
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Rotate Right"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => updateItem(selectedItem.uid, { flipX: !selectedItem.flipX })}
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Flip Horizontally"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={() => updateItem(selectedItem.uid, { zIndex: selectedItem.zIndex + 1 })}
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Bring Forward"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  updateItem(selectedItem.uid, { zIndex: Math.max(1, selectedItem.zIndex - 1) })
                }
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Send Backward"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => duplicateItem(selectedItem.uid)}
                className="p-2 rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 shrink-0"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => deleteItem(selectedItem.uid)}
                className="p-2 rounded-lg hover:bg-rose-950 active:bg-rose-900 text-rose-400 shrink-0"
                title="Delete Specimen"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedUid(null)}
                className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 shrink-0"
                title="Deselect"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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

        {/* ========================================== */}
        {/* BUILDER DRAWER                             */}
        {/* ========================================== */}
        <aside
          className={`order-2 lg:order-1 lg:col-span-4 xl:col-span-4 border-t lg:border-t-0 lg:border-r border-stone-800/80 bg-stone-900/90 backdrop-blur-md flex flex-col shrink-0 transition-all duration-300 z-20 ${
            mobileDrawerMinimized ? 'h-12 lg:h-full' : 'h-[45dvh] sm:h-[42dvh] lg:h-full'
          }`}
        >
          {/* Category Tabs (5 Tabs including Hardware) */}
          <div className="flex items-center gap-1 p-1.5 sm:p-2 bg-stone-950/70 border-b border-stone-800 shrink-0">
            <div className="grid grid-cols-5 gap-1 flex-1">
              {[
                { id: 'vessels', label: 'Vessels', icon: Box },
                { id: 'substrates', label: 'Soil', icon: Layers },
                { id: 'flora', label: 'Flora', icon: Flower2 },
                { id: 'hardscape', label: 'Decor', icon: Mountain },
                { id: 'hardware', label: 'Circuits', icon: Cpu },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as ActiveTab);
                      setMobileDrawerMinimized(false);
                    }}
                    className={`py-1.5 sm:py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Minimize / Expand Sheet Button */}
            <button
              onClick={() => setMobileDrawerMinimized((m) => !m)}
              className="lg:hidden p-2 rounded-lg bg-stone-800/80 text-stone-300 hover:text-white border border-stone-700/70 ml-1"
              title={mobileDrawerMinimized ? 'Expand Tray' : 'Minimize Tray'}
            >
              {mobileDrawerMinimized ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          {!mobileDrawerMinimized && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain">
              {/* TAB 1: VESSELS */}
              {activeTab === 'vessels' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-stone-400">
                    Choose a glass enclosure. Prices include pre-drilled cable grommets for smart hardware lids.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {VESSELS.map((v) => {
                      const selected = v.id === vesselId;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            sfx.playPop(0.95);
                            setVesselId(v.id);
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                            selected
                              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                              : 'bg-stone-800/40 border-stone-800 hover:border-stone-700 text-stone-300'
                          }`}
                        >
                          <div className="pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs sm:text-sm">{v.name}</span>
                              <span className="text-xs font-semibold text-emerald-400">
                                ${v.price}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">{v.subtitle}</div>
                          </div>
                          <div className="w-9 h-11 rounded-lg bg-stone-900/90 border border-stone-700/60 flex items-center justify-center p-1 shrink-0">
                            <svg viewBox="0 0 400 500" className="w-full h-full">
                              <path
                                d={v.outlinePath}
                                fill="rgba(52,211,153,0.12)"
                                stroke="#34d399"
                                strokeWidth="18"
                              />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SUBSTRATES */}
              {activeTab === 'substrates' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                      Tap to Add Layer ({substrates.length}/6)
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBSTRATES.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => addSubstrateLayer(sub.id)}
                          disabled={substrates.length >= 6}
                          className="p-2 rounded-xl bg-stone-800/60 hover:bg-stone-800 active:bg-stone-700 border border-stone-700/70 text-left transition flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                        >
                          <span
                            className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner"
                            style={{
                              background: `linear-gradient(to bottom, ${sub.colorTop}, ${sub.colorBottom})`,
                            }}
                          />
                          <div className="overflow-hidden flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-stone-200 truncate">
                                {sub.name}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold ml-1">
                                +${sub.pricePerLayer}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400 truncate">{sub.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Layer Stack */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Active Soil Stack (Top to Bottom)
                    </h3>
                    {[...substrates].reverse().map((layer, revIdx) => {
                      const actualIdx = substrates.length - 1 - revIdx;
                      const cfg = SUBSTRATES.find((s) => s.id === layer.type) || SUBSTRATES[0];
                      return (
                        <div
                          key={layer.uid}
                          className="p-2.5 sm:p-3 rounded-xl bg-stone-800/50 border border-stone-700/70 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20"
                                style={{ backgroundColor: cfg.colorTop }}
                              />
                              <span className="text-xs font-medium text-stone-200">{cfg.name}</span>
                              <span className="text-[11px] text-emerald-400">
                                ${cfg.pricePerLayer}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveSubstrate(actualIdx, 1)}
                                disabled={actualIdx === substrates.length - 1}
                                className="p-1.5 rounded hover:bg-stone-700 text-stone-400 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveSubstrate(actualIdx, -1)}
                                disabled={actualIdx === 0}
                                className="p-1.5 rounded hover:bg-stone-700 text-stone-400 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeSubstrate(layer.uid)}
                                className="p-1.5 rounded hover:bg-rose-950 text-stone-400 hover:text-rose-400"
                                title="Remove Layer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                                <span>Depth</span>
                                <span>{layer.depth}mm</span>
                              </div>
                              <input
                                type="range"
                                min={15}
                                max={85}
                                value={layer.depth}
                                onChange={(e) =>
                                  updateSubstrate(layer.uid, { depth: Number(e.target.value) })
                                }
                                className="w-full accent-emerald-400 cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                                <span>Slope Wave</span>
                                <span>
                                  {layer.contour > 0 ? `+${layer.contour}` : layer.contour}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={-25}
                                max={25}
                                value={layer.contour}
                                onChange={(e) =>
                                  updateSubstrate(layer.uid, { contour: Number(e.target.value) })
                                }
                                className="w-full accent-emerald-400 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3 & 4: FLORA & HARDSCAPE CATALOG */}
              {(activeTab === 'flora' || activeTab === 'hardscape') && (
                <div className="space-y-2.5">
                  <p className="text-xs text-stone-400">
                    Tap any specimen to plant it, then drag it inside the glass vessel.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                    {CATALOG_ITEMS.filter((item) => item.category === activeTab).map((catItem) => (
                      <button
                        key={catItem.id}
                        onClick={() => addItem(catItem)}
                        className="group p-2.5 rounded-xl bg-stone-800/40 hover:bg-stone-800/90 active:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 transition flex flex-col items-center text-center cursor-pointer relative"
                      >
                        <span className="absolute top-1.5 left-2 text-[10px] font-semibold text-emerald-400">
                          ${catItem.price}
                        </span>
                        {catItem.bioluminescent && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                            Glows
                          </span>
                        )}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mt-2">
                          <svg viewBox="-50 -70 100 85" className="w-full h-full overflow-visible">
                            {catItem.renderSvg(lighting === 'night')}
                          </svg>
                        </div>
                        <div className="text-xs font-medium text-stone-200 group-hover:text-emerald-300 transition mt-0.5 line-clamp-1">
                          {catItem.name}
                        </div>
                        <div className="text-[10px] italic text-stone-400 line-clamp-1">
                          {catItem.latin}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <Plus className="w-3 h-3" /> Plant
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ANDREW'S SMART HARDWARE & CIRCUITS */}
              {activeTab === 'hardware' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                      <Wrench className="w-4 h-4" />
                      <span>Custom-Engineered Vivarium Hardware</span>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-1">
                      Designed &amp; soldered in-house. Equipping modules integrates custom PCBs, sensors, and misting manifolds directly into your vessel lid.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {HARDWARE_MODULES.map((hw) => {
                      const isEquipped = equippedHardware.includes(hw.id);
                      return (
                        <div
                          key={hw.id}
                          onClick={() => toggleHardware(hw.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            isEquipped
                              ? 'bg-emerald-950/50 border-emerald-500/70 shadow-sm'
                              : 'bg-stone-800/40 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-stone-100">
                                  {hw.name}
                                </span>
                                <span className="text-xs font-bold text-emerald-400">
                                  +${hw.price}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-amber-300/90 mt-0.5">
                                {hw.specs}
                              </div>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                                isEquipped
                                  ? 'bg-emerald-500 border-emerald-400 text-stone-950'
                                  : 'border-stone-600 text-transparent'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                            {hw.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-800/80">
                            <span>SKU: {hw.sku}</span>
                            <span>Power: {hw.powerDraw}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* ========================================== */}
      {/* BLUEPRINT SPEC SHEET & CHECKOUT MODAL      */}
      {/* ========================================== */}
      {isBlueprintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-stone-100 flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-emerald-400" />
                  Custom Terrarium Blueprint &amp; BOM Quote
                </h2>
                <p className="text-xs text-stone-400">
                  Serialized build recipe ready for Andrew&apos;s workshop &amp; Stripe Checkout
                </p>
              </div>
              <button
                onClick={() => setIsBlueprintModalOpen(false)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Fulfillment Mode Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">
                  Select Fulfillment &amp; Assembly Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setFulfillmentType('assembled_local')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      fulfillmentType === 'assembled_local'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-stone-800/50 border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-emerald-400" /> Fully Planted &amp; Soldered
                      </span>
                      <span>+$25</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Hand-planted &amp; wired in our SoCal studio. Local pickup or courier delivery.
                    </p>
                  </button>

                  <button
                    onClick={() => setFulfillmentType('diy_kit_shipped')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      fulfillmentType === 'diy_kit_shipped'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-stone-800/50 border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-sky-400" /> Nationwide DIY Kit + Smart Lid
                      </span>
                      <span>$0 Fee</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Pre-soldered hardware lid + individually packaged plants, substrates &amp; printed build guide.
                    </p>
                  </button>
                </div>
              </div>

              {/* Itemized Bill of Materials */}
              <div className="rounded-xl bg-stone-950/80 border border-stone-800 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <div>
                    <span className="font-semibold text-stone-200">{currentVessel.name}</span>
                    <span className="ml-2 text-xs font-mono text-stone-400">
                      ({currentVessel.sku})
                    </span>
                  </div>
                  <span className="font-semibold">${bomSummary.vesselCost}</span>
                </div>

                {/* Hardware List */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Smart Hardware &amp; Circuits ({equippedHardware.length})
                  </div>
                  {equippedHardware.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">
                      No active circuits selected (passive glass enclosure)
                    </p>
                  ) : (
                    equippedHardware.map((id) => {
                      const hw = HARDWARE_MODULES.find((h) => h.id === id)!;
                      return (
                        <div key={id} className="flex justify-between text-xs py-0.5 text-stone-300">
                          <span>
                            • {hw.name} <span className="font-mono text-stone-500">[{hw.sku}]</span>
                          </span>
                          <span>${hw.price}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Substrate List */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Substrate Layers ({substrates.length})
                  </div>
                  {substrates.map((s, i) => {
                    const cfg = SUBSTRATES.find((sub) => sub.id === s.type)!;
                    return (
                      <div key={s.uid} className="flex justify-between text-xs py-0.5 text-stone-300">
                        <span>
                          Layer {i + 1}: {cfg.name} ({s.depth}mm depth, slope {s.contour})
                        </span>
                        <span>${cfg.pricePerLayer}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Flora & Hardscape List */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Botanicals &amp; Hardscape ({items.length})
                  </div>
                  {items.map((item) => {
                    const cat = CATALOG_ITEMS.find((c) => c.id === item.itemId)!;
                    return (
                      <div key={item.uid} className="flex justify-between text-xs py-0.5 text-stone-300">
                        <span>
                          • {cat.name} @ (x:{item.x}, y:{item.y}, scale:{item.scale}x)
                        </span>
                        <span>${cat.price}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-stone-800 pt-3 flex justify-between items-center text-base font-bold text-emerald-300">
                  <span>Estimated Build Total</span>
                  <span>${bomSummary.total}.00 USD</span>
                </div>
              </div>

              {/* Developer JSON Blueprint Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono uppercase text-stone-400">
                    Serialized Order Payload (PostgreSQL / Stripe Metadata)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyBlueprintToClipboard}
                      className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedJson ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button
                      onClick={downloadBlueprintJson}
                      className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .json
                    </button>
                  </div>
                </div>
                <pre className="bg-black/70 border border-stone-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300/90 max-h-40 overflow-y-auto">
                  {JSON.stringify(serializedBlueprint, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-stone-400">
                Next step in Phase 3: Connect button to <code className="text-emerald-300">/api/checkout</code> Stripe Session
              </span>
              <button
                onClick={() => {
                  alert(
                    `Blueprint locked! Total: $${bomSummary.total}.00 USD.\nReady to POST serialized JSON to your Next.js / Stripe Checkout endpoint.`
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Proceed to Checkout (${bomSummary.total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
