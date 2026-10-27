import type { CartItem } from "../types/terrarium";

/**
 * The greenhouse holds the shopper's jars (custom Studio builds and editions) plus any
 * accessories until checkout. Counts them separately, e.g. "2 jars · 1 accessory".
 */
export function greenhouseCountLabel(items: CartItem[]): string {
  let jars = 0;
  let accessories = 0;
  for (const item of items) {
    if (item.type === "hardware") accessories += item.quantity;
    else jars += item.quantity;
  }
  const parts = [`${jars} ${jars === 1 ? "jar" : "jars"}`];
  if (accessories > 0) parts.push(`${accessories} ${accessories === 1 ? "accessory" : "accessories"}`);
  return parts.join(" · ");
}
