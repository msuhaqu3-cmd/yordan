import type { Metadata } from "next";
import { readContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy | Yordan Decorations & Building",
  description:
    "How this website uses cookies and similar technologies. We do not use advertising or analytics cookies.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/cookie-policy.html` },
  manifest: "/manifest.webmanifest",
};

export default function Page() {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: readContent("legal/cookie-policy.html") }} />;
}
