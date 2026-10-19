import type { EcosystemPreset } from '../types/terrarium';

export const PRESETS: Record<string, EcosystemPreset> = {
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
