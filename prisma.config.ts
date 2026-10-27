import { defineConfig } from "prisma/config";

// Load local secrets for the Prisma CLI. `vercel env pull` writes .env.local; .env is also
// supported. All are git-ignored. On Vercel the variables are already in the environment.
// The first file to set a variable wins, so .env.development.local (the Neon `development`
// branch) overrides the production values in .env.local, matching `next dev`.
for (const file of [".env.development.local", ".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File not present: fine.
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (unpooled) connection when Neon provides one.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
