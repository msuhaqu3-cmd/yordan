"use client";

import { useEffect } from "react";
import { initApp } from "./app-ui";

/** Starts the mobile-app UI (tabs, services sheet, quote wizard, ...) on the server-rendered markup. */
export default function AppBehaviour() {
  useEffect(() => {
    const w = window as unknown as { __yordanAppInit?: boolean };
    if (w.__yordanAppInit) return;
    w.__yordanAppInit = true;
    try {
      initApp();
    } catch (err) {
      console.error("App script failed", err);
    }
  }, []);
  return null;
}
