import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { applyTokens } from "@/lib/settings";
import { getSiteData } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms & Conditions | Yordan Decorations & Building",
  description:
    "Website terms and general terms for services from Yordan Decorations & Building Ltd, company number 12719725.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/terms.html` },
  manifest: "/manifest.webmanifest",
};

export default async function Page() {
  const d = await getSiteData();
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: applyTokens(readContent("legal/terms.html"), d.vars) }} />;
}
