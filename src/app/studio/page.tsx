import type { Metadata } from "next";
import { StudioView } from "../../site/views";

export const metadata: Metadata = {
  title: "Studio",
  description: "Choose a vessel, foundation, flora and details, and see your terrarium take shape.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return <StudioView />;
}
