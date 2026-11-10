import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { applyTokens } from "@/lib/settings";
import { getSiteData } from "@/lib/site-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cookie Policy | Yordan Decorations & Building",
  description:
    "How this website uses cookies and similar technologies. We do not use advertising or analytics cookies.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/cookie-policy.html` },
  manifest: "/manifest.webmanifest",
};

export default async function Page() {
  const d = await getSiteData();
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: applyTokens(readContent("legal/cookie-policy.html"), d.vars) }} />;
}
