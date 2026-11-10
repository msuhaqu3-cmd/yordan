import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { applyTokens } from "@/lib/settings";
import { getSiteData } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy | Yordan Decorations & Building",
  description:
    "How Yordan Decorations & Building Ltd (company number 12719725) collects, uses and protects your personal information.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/privacy-policy.html` },
  manifest: "/manifest.webmanifest",
};

export default async function Page() {
  const d = await getSiteData();
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: applyTokens(readContent("legal/privacy-policy.html"), d.vars) }} />;
}
