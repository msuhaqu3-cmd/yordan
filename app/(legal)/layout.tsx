import type { Viewport } from "next";
import type { ReactNode } from "react";
import { FONTS_HREF, THEME } from "@/lib/site";
import PwaRegister from "@/components/pwa-register";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME,
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_HREF} rel="stylesheet" />
        <link rel="stylesheet" href="/legal.css" />
        <link rel="icon" type="image/webp" href="/images/logo.webp" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
