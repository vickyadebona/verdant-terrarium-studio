import type { Metadata } from "next";
import { OurStoryView } from "../../site/views";

export const metadata: Metadata = {
  title: "Our Story",
  description: "How every TerraScape is planted, tested and rested by hand in our Los Angeles studio.",
  alternates: { canonical: "/our-story" },
};

export default function OurStoryPage() {
  return <OurStoryView />;
}
