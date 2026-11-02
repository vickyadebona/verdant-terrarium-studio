/**
 * How a shopper prefers to pay. This is only a preference: card details are never stored by
 * TerraScape. Saved cards will live with Stripe once real checkout arrives.
 */
export const PAYMENT_PREFERENCES = [
  { id: "card", label: "Credit or debit card" },
  { id: "apple_pay", label: "Apple Pay" },
  { id: "google_pay", label: "Google Pay" },
  { id: "stripe_link", label: "Stripe Link" },
] as const;

export type PaymentPreference = (typeof PAYMENT_PREFERENCES)[number]["id"];

export function isPaymentPreference(value: unknown): value is PaymentPreference {
  return PAYMENT_PREFERENCES.some((preference) => preference.id === value);
}
