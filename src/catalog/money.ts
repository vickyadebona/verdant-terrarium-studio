// All prices in TerraScape are integer US cents. Format only at the edge.

const wholeDollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** "$84" for whole-dollar amounts, "$10.07" otherwise. */
export function formatCents(cents: number): string {
  return cents % 100 === 0 ? wholeDollars.format(cents / 100) : withCents.format(cents / 100);
}

/** Always shows cents ("$84.00"); use for totals and receipts. */
export function formatCentsExact(cents: number): string {
  return withCents.format(cents / 100);
}
