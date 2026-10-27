import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STUDIO_EDITIONS, getEdition } from "../../../catalog/editions";
import { EditionView } from "../../../site/views";

// Only the three studio editions exist; any other id is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(STUDIO_EDITIONS).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const edition = getEdition((await params).id);
  if (!edition) return {};
  return {
    title: edition.name,
    description: edition.tagline,
    alternates: { canonical: `/editions/${edition.id}` },
    openGraph: {
      title: `${edition.name} · TerraScape`,
      description: edition.tagline,
      images: [{ url: edition.image, alt: `${edition.name} studio edition terrarium` }],
    },
  };
}

export default async function EditionPage({ params }: { params: Promise<{ id: string }> }) {
  const edition = getEdition((await params).id);
  if (!edition) notFound();
  return <EditionView id={edition.id} />;
}
