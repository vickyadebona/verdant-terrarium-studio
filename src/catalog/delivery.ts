import {
  COURIER_FEE_CENTS,
  ESTIMATED_TAX_RATE,
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPED_FEE_CENTS,
} from './index';
import { formatCents } from './money';

/**
 * Delivery is chosen once per order. Courier and pickup orders are planted in the
 * studio (custom builds add the assembly fee); shipped orders send builds as DIY kits.
 */
export type ShippingOption = 'courier' | 'pickup' | 'shipped';

export const SHIPPING_OPTIONS: ShippingOption[] = ['courier', 'pickup', 'shipped'];

/** Rest period in the studio incubation bay before an assembled build leaves. */
export const QUARANTINE_HOURS = 72;

export interface DeliveryOptionSpec {
  title: string;
  summary: string;
  /** True when builds are planted and soldered in the studio. */
  assembled: boolean;
  /** Business days from order until the build is handed off or the kit ships. */
  leadBusinessDays: { min: number; max: number };
  carrier?: string;
}

export const DELIVERY_OPTIONS: Record<ShippingOption, DeliveryOptionSpec> = {
  courier: {
    title: 'Studio courier · Southern California',
    summary: `Planted in our Los Angeles studio, rested ${QUARANTINE_HOURS} hours, then hand-delivered.`,
    assembled: true,
    leadBusinessDays: { min: 5, max: 7 },
    carrier: 'TerraScape Studio Courier',
  },
  pickup: {
    title: 'Studio pickup · Venice, CA',
    summary: `Planted in our studio and rested ${QUARANTINE_HOURS} hours, then ready for you to collect.`,
    assembled: true,
    leadBusinessDays: { min: 5, max: 7 },
  },
  shipped: {
    title: 'Nationwide shipping · DIY kit',
    summary: 'Custom builds and editions arrive as kits: plants, layered substrate and a pre-wired lid.',
    assembled: false,
    leadBusinessDays: { min: 3, max: 5 },
    carrier: 'UPS Ground (insulated)',
  },
};

export function isShippingOption(value: unknown): value is ShippingOption {
  return typeof value === 'string' && (SHIPPING_OPTIONS as string[]).includes(value);
}

export function shippingCentsFor(option: ShippingOption, subtotalCents: number): number {
  if (option === 'pickup') return 0;
  if (option === 'courier') return COURIER_FEE_CENTS;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPED_FEE_CENTS;
}

/** "$18", "Free" or "$18 · free over $150", for option lists and product pages. */
export function deliveryFeeLabel(option: ShippingOption, subtotalCents?: number): string {
  if (option === 'pickup') return 'Free';
  if (option === 'courier') return formatCents(COURIER_FEE_CENTS);
  if (subtotalCents === undefined) {
    return `${formatCents(SHIPPED_FEE_CENTS)} · free over ${formatCents(FREE_SHIPPING_THRESHOLD_CENTS)}`;
  }
  const cents = shippingCentsFor(option, subtotalCents);
  return cents === 0 ? 'Free' : formatCents(cents);
}

export function leadTimeLabel(option: ShippingOption): string {
  const { min, max } = DELIVERY_OPTIONS[option].leadBusinessDays;
  const verb = option === 'shipped' ? 'Ships in' : option === 'pickup' ? 'Ready in' : 'Delivered in';
  return `${verb} ${min}–${max} business days`;
}

export const TAX_RATE_LABEL = `${+(ESTIMATED_TAX_RATE * 100).toFixed(2)}%`;

export function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date;
}
