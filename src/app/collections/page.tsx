import type { Metadata } from "next";
import { CollectionsView } from "../../site/views";

export const metadata: Metadata = {
  title: { absolute: "TerraScape — A world of green, under glass" },
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return <CollectionsView />;
}
