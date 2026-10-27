import "server-only";
import { PrismaClient } from "../generated/prisma/client";
import { prismaAdapterFor } from "./prismaAdapter";

// One Prisma client per server process. In development, Next.js reloads modules on every edit,
// so the client is kept on globalThis to avoid opening a new connection pool each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local` or see .env.example.");
  }
  const client = new PrismaClient({ adapter: prismaAdapterFor(connectionString) });
  globalForPrisma.prisma = client;
  return client;
}

/**
 * The database. The client is created on first use rather than on import, so `next build`
 * (which loads every route) works without database credentials, as in CI.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
