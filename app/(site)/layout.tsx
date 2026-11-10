import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import jsonLd from "@/lib/jsonld.json";
import { applyTokens } from "@/lib/settings";
import { getSiteData } from "@/lib/site-data";
import { FONTS_HREF, SITE_NAME, SITE_URL, THEME } from "@/lib/site";
import PwaRegister from "@/components/pwa-register";
import InstallApp from "@/components/install-app";

const TITLE = "Builders & Decorators North London | Yordan Decorations & Building";
const desc = (phone: string) =>
  `Insured builders, painters & decorators in North London (N8, Haringey). Renovations, loft conversions, kitchens, bathrooms, plumbing, electrical, HMO maintenance. Free quotes: ${phone}.`;
const OG_IMG = `${SITE_URL}/images/building-renovation-london.webp`;

const splash: [number, number, number][] = [
  [430, 932, 3],
  [393, 852, 3],
  [428, 926, 3],
  [390, 844, 3],
  [375, 812, 3],
  [414, 896, 2],
  [375, 667, 2],
  [1024, 1366, 2],
  [834, 1194, 2],
  [810, 1080, 2],
];

export async function generateMetadata(): Promise<Metadata> {
  const { vars } = await getSiteData();
  const DESC = desc(vars.PHONE);
  return {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  authors: [{ name: SITE_NAME }],
  applicationName: "Yordan Decorations & Building",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  verification: { google: "97F56araNYwDMs5aUKD-05p3f--sRMGWalklPPMevOU" },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: { "en-GB": `${SITE_URL}/`, "x-default": `${SITE_URL}/` },
  },
  icons: {
    icon: [{ url: "/images/logo.webp", type: "image/webp" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Yordan",
    statusBarStyle: "black",
    startupImage: splash.map(([w, h, r]) => ({
      url: `/splash/${w * r}x${h * r}.png`,
      media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`,
    })),
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    url: `${SITE_URL}/`,
    title: TITLE,
    description:
      "Building, renovation, decorating and maintenance for homeowners, landlords and businesses across London. Fully insured. Free quotes.",
    images: [{ url: OG_IMG, alt: "Building and renovation work by Yordan Decorations & Building Ltd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "Building, renovation, decorating and maintenance across London. Fully insured. Free quotes.",
    images: [OG_IMG],
  },
  other: {
    "geo.region": "GB-HRY",
    "geo.placename": "Haringey, London N8",
    "geo.position": "51.587598;-0.107096",
    ICBM: "51.587598, -0.107096",
    "mobile-web-app-capable": "yes",
  },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME,
};

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const { vars } = await getSiteData();
  const ld = applyTokens(JSON.stringify(jsonLd), vars);
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONTS_HREF} rel="stylesheet" />
        {/* Installed app (standalone) opens the mobile app UI instead of the website. Runs before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if((matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)&&location.pathname==='/'){location.replace('/app'+location.search)}}catch(e){}",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld.replace(/</g, "\\u003c") }} />
      </head>
      <body>
        {children}
        <PwaRegister />
        <InstallApp />
      </body>
    </html>
  );
}
