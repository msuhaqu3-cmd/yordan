import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./app.css";
import PwaRegister from "@/components/pwa-register";
import { SITE_URL, THEME } from "@/lib/site";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Yordan Decorations & Building",
  description: "Yordan Decorations & Building Ltd mobile app: services, projects, free quotes and emergency help.",
  // The app UI is for installed users; the public website is what search engines should index.
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/images/logo.webp", type: "image/webp" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "Yordan", statusBarStyle: "black" },
  formatDetection: { telephone: false },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME,
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
