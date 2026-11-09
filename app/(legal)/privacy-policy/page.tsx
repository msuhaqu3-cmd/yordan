import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Yordan Decorations & Building",
  description:
    "How Yordan Decorations & Building Ltd (company number 12719725) collects, uses and protects your personal information.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/privacy-policy.html` },
  manifest: "/manifest.webmanifest",
};

export default function Page() {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: readContent("legal/privacy-policy.html") }} />;
}
