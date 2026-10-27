import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

// One Prisma client per server process. In development, Next.js reloads modules on every edit,
// so the client is kept on globalThis to avoid opening a new connection pool each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local` or see .env.example.");
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
