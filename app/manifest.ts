import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Yordan Decorations & Building Ltd",
    short_name: "Yordan",
    description:
      "Builders, painters & decorators in North London. Renovations, loft conversions, kitchens, bathrooms and property maintenance. Free quotes.",
    lang: "en-GB",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    categories: ["business", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Get a quote", url: "/#quote", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Call us", url: "tel:+447846292529" },
    ],
  };
}
