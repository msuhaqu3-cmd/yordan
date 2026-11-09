"use client";

import { useEffect } from "react";
import { initHome } from "./legacy-home";

/**
 * Runs the site's original interactive behaviour (preloader, menu, gallery, quote form,
 * assistant, ...) against the server-rendered markup. Renders nothing itself.
 */
export default function HomeBehaviour() {
  useEffect(() => {
    const w = window as unknown as { __yordanInit?: boolean };
    if (w.__yordanInit) return;
    w.__yordanInit = true;
    try {
      initHome();
    } catch (err) {
      // Never leave the visitor behind the preloader if something unexpected happens.
      console.error("Site script failed", err);
      document.getElementById("pre")?.style.setProperty("display", "none");
      document.body.classList.add("ready");
    }
  }, []);
  return null;
}
