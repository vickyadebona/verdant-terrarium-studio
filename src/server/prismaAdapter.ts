import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Neon's serverless driver for Neon databases (Vercel and local development); the standard
 * Postgres driver for anything else, such as the throwaway database CI's browser tests use.
 */
export function prismaAdapterFor(connectionString: string) {
  let host = "";
  try {
    host = new URL(connectionString).hostname;
  } catch {
    // Not a URL: let the Postgres driver report the problem.
  }
  return host.endsWith(".neon.tech")
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });
}
