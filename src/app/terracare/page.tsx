import type { Metadata } from "next";
import { TerraCareView } from "../../site/views";

export const metadata: Metadata = {
  title: "TerraCare",
  description: "Step-by-step assembly and care guides to keep your terrarium thriving year-round.",
  alternates: { canonical: "/terracare" },
};

export default function TerraCarePage() {
  return <TerraCareView />;
}
