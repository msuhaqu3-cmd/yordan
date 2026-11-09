import type { Viewport } from "next";
import type { ReactNode } from "react";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b0b0b" };
export const metadata = { title: "Offline | Yordan Decorations & Building", robots: { index: false, follow: false } };

const css = `*{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;padding-top:max(24px,env(safe-area-inset-top));padding-bottom:max(24px,env(safe-area-inset-bottom));background:#0b0b0b;color:#f4f1ea;font:400 16px/1.7 Inter,system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:420px}img{width:200px;height:auto;margin:0 auto 28px;display:block}h1{font:500 30px/1.2 'Playfair Display',Georgia,serif;margin:0 0 12px}p{color:#9a958a;margin:0 0 22px}
a,button{display:inline-block;font:600 14px Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;cursor:pointer;padding:15px 26px;border:1px solid #b89a5e;background:#b89a5e;color:#0b0b0b;margin:4px}a.o{background:transparent;color:#b89a5e}`;

export default function OfflineLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
