"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

function isIosSafari() {
  const ua = navigator.userAgent;
  const ios =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA/.test(ua);
  return { ios, safari };
}

/**
 * Wires up the footer "Install App" link (present, but hidden, in the page markup):
 *  - Chrome/Edge/Android: shown once the browser says the app is installable; opens the native prompt.
 *  - iPhone/iPad Safari: shown, opens Share -> Add to Home Screen instructions (iOS has no install API).
 *  - Hidden when already installed / running standalone, and in unsupported browsers.
 */
export default function InstallApp() {
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const link = document.getElementById("install-app") as HTMLAnchorElement | null;
    if (!link || isStandalone()) return;

    let deferred: InstallEvent | null = null;
    const show = () => link.removeAttribute("hidden");
    const hide = () => link.setAttribute("hidden", "");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as InstallEvent;
      show();
    };
    const onInstalled = () => {
      deferred = null;
      hide();
      setSheet(false);
    };
    const onClick = async (e: Event) => {
      e.preventDefault();
      if (deferred) {
        const d = deferred;
        deferred = null;
        await d.prompt();
        const { outcome } = await d.userChoice;
        if (outcome === "accepted") hide();
        else {
          // Browsers only fire beforeinstallprompt again later; keep link hidden until then.
          hide();
        }
      } else {
        setSheet(true);
      }
    };

    const { ios, safari } = isIosSafari();
    if (ios && safari) show();

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    link.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      link.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  if (!sheet) return null;
  return (
    <div className="ins-bg" role="presentation" onClick={() => setSheet(false)}>
      <div
        className="ins"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ins-t"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="ins-t">Install Yordan on your iPhone</h3>
        <ol>
          <li>
            Tap the <b>Share</b> button{" "}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            in Safari&rsquo;s toolbar.
          </li>
          <li>
            Scroll down and tap <b>Add to Home Screen</b>.
          </li>
          <li>
            Tap <b>Add</b>. The app icon will appear on your home screen.
          </li>
        </ol>
        <button type="button" className="btn" onClick={() => setSheet(false)}>
          Got it
        </button>
      </div>
    </div>
  );
}
