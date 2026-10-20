import type { HardwareModule } from '../types/terrarium';

// ANDREW'S CUSTOM HARDWARE & CIRCUIT MODULES
export const HARDWARE_MODULES: HardwareModule[] = [
  {
    id: 'circadian_led',
    sku: 'HW-LED-PWM1',
    name: 'Circadian PWM Grow-LED Ring',
    specs: 'Custom PCB • 2700K–6500K + 395nm UV • USB-C 5V',
    description:
      'Custom-machined lid ring with programmable sunrise, midday, golden hour, and night bioluminescence spectrums. Included standard.',
    price: 0,
    powerDraw: '4.5W PWM',
  },
  {
    id: 'ultrasonic_mist',
    sku: 'HW-MST-PZO2',
    name: 'Ultrasonic Piezo Mist Atomizer',
    specs: '113kHz Piezo Transducer • 80mL Hidden Reservoir',
    description:
      'Micro-engineered misting manifold integrated into the vessel top that generates ultra-fine cloud fog on schedule. Included standard.',
    price: 0,
    powerDraw: '2.0W 5V',
  },
  {
    id: 'hygro_controller',
    sku: 'HW-SEN-SHT4',
    name: 'Closed-Loop Climate Controller',
    specs: 'Sensirion SHT40 I2C Sensor + Micro Brushless Fan',
    description:
      'Monitors internal relative humidity & temperature in real time, automatically cycling airflow to prevent glass condensation. Included standard.',
    price: 0,
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
