import type { Metadata } from "next";
import { AccountView } from "../../site/views";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { mode } = await searchParams;
  return <AccountView initialMode={mode === "login" ? "login" : "signup"} />;
}
