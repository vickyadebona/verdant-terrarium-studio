import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Old and alternative URLs from the single-page app. Bookmarks and shared links keep working.
  async redirects() {
    return [
      { source: "/", destination: "/collections", permanent: false },
      { source: "/home", destination: "/collections", permanent: true },
      { source: "/about", destination: "/our-story", permanent: true },
      { source: "/design", destination: "/our-story", permanent: true },
      { source: "/build", destination: "/studio", permanent: true },
      // /checkout and /payments were the old Studio review steps; the Studio now hands off to the jar.
      { source: "/checkout", destination: "/studio", permanent: true },
      { source: "/payments", destination: "/studio", permanent: true },
      { source: "/edition/:id", destination: "/editions/:id", permanent: true },
      // Hyphenated edition links, e.g. /editions/fern-study
      { source: "/editions/cloud-forest", destination: "/editions/cloud_forest", permanent: true },
      { source: "/editions/fern-study", destination: "/editions/fern_study", permanent: true },
      { source: "/editions/moss-garden", destination: "/editions/moss_garden", permanent: true },
    ];
  },
};

export default nextConfig;
