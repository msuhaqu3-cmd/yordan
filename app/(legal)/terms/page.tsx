import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions | Yordan Decorations & Building",
  description:
    "Website terms and general terms for services from Yordan Decorations & Building Ltd, company number 12719725.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/terms.html` },
  manifest: "/manifest.webmanifest",
};

export default function Page() {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: readContent("legal/terms.html") }} />;
}
