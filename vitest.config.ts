import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vite only runs the unit tests now; Next.js builds and serves the site.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
