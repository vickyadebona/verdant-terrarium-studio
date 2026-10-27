import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Manrope } from "next/font/google";
import { Providers } from "./providers";
import "../index.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

const SITE_URL = "https://terrascape-studio.vercel.app";
const DESCRIPTION =
  "Design a living terrarium in the TerraScape Studio, or choose a studio edition. Hand-built in Los Angeles with a smart lid for light and mist.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TerraScape — A world of green, under glass",
    template: "%s · TerraScape",
  },
  description: DESCRIPTION,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "TerraScape",
    title: "TerraScape — A world of green, under glass",
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A lush cylindrical TerraScape terrarium with a smooth white lid",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#18392b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${manrope.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
