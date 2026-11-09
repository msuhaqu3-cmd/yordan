"use client";

import { useEffect } from "react";

/** Registers the service worker (production only, HTTPS or localhost). */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          // Check for a new deployment whenever the app is reopened.
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") reg.update().catch(() => {});
          });
        })
        .catch((err) => console.warn("Service worker registration failed", err));
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
