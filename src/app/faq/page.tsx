import type { Metadata } from "next";
import { FaqView } from "../../site/views";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, delivery, the smart lid, watering and our living arrival guarantee.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <FaqView />;
}
