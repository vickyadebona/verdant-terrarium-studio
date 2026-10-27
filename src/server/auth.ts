import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { googleSignInEnabled } from "./authFlags";
import { db } from "./db";

/**
 * Accounts and sessions (Better Auth). Users, sessions, linked sign-in methods (email + hashed
 * password, Google) and rate-limit counters live in Postgres; the browser only holds an
 * HTTP-only session cookie.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  // BETTER_AUTH_URL wins when set. Otherwise the URL comes from the request, limited to our own
  // hosts: production, staging, branch previews (all terrascape-*.vercel.app) and local dev.
  baseURL: process.env.BETTER_AUTH_URL ?? {
    allowedHosts: ["terrascape-*.vercel.app", "localhost:*", "127.0.0.1:*"],
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Shoppers are signed in as soon as they create an account (no email step yet).
    autoSignIn: true,
  },
  socialProviders: googleSignInEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  user: {
    additionalFields: {
      // Our team gets STUDIO or ADMIN in the database; nobody can set it when signing up.
      role: { type: "string", required: false, defaultValue: "CUSTOMER", input: false },
    },
  },
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    storage: "database",
  },
  // Must stay last: lets server actions set the session cookie.
  plugins: [nextCookies()],
});
