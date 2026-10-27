// Loads the catalog from src/catalog into the Product table. Safe to run repeatedly:
// each product is upserted by SKU, so prices and names update in place.
import { PrismaClient, type ProductKind } from "../src/generated/prisma/client";
import { prismaAdapterFor } from "../src/server/prismaAdapter";
import {
  ACCESSORY_PRODUCTS,
  EDITION_MAX_QUANTITY,
  EDITION_PRODUCTS,
  STUDIO_OPTIONS,
  type ProductKind as CatalogKind,
} from "../src/catalog";

const KIND: Record<CatalogKind, ProductKind> = {
  vessel: "VESSEL",
  foundation: "FOUNDATION",
  flora: "FLORA",
  hardscape: "HARDSCAPE",
  hardware: "HARDWARE",
  edition: "EDITION",
};

type SeedProduct = {
  sku: string;
  slug: string;
  name: string;
  kind: ProductKind;
  priceCents: number;
  note?: string;
  maxPerOrder?: number;
  sortOrder: number;
};

export function catalogProducts(): SeedProduct[] {
  return [
    ...STUDIO_OPTIONS.map((option, index) => ({
      sku: option.sku,
      slug: option.id,
      name: option.name,
      kind: KIND[option.kind],
      priceCents: option.priceCents,
      note: option.note,
      sortOrder: index,
    })),
    ...Object.entries(EDITION_PRODUCTS).map(([slug, product], index) => ({
      sku: product.sku,
      slug,
      name: product.name,
      kind: KIND[product.kind],
      priceCents: product.priceCents,
      maxPerOrder: EDITION_MAX_QUANTITY,
      sortOrder: 100 + index,
    })),
    ...Object.entries(ACCESSORY_PRODUCTS).map(([slug, product], index) => ({
      sku: product.sku,
      slug,
      name: product.name,
      kind: KIND[product.kind],
      priceCents: product.priceCents,
      sortOrder: 200 + index,
    })),
  ];
}

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: prismaAdapterFor(connectionString) });

  const products = catalogProducts();
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
  await prisma.$disconnect();
}

// Run only when executed as a script (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
