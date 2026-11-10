"use client";

import { useEffect, useRef, useState } from "react";

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
 * "Download Mobile App" floating button + footer link (the link exists, hidden, in the page markup).
 *  - Android: shown; uses the native install prompt when the browser provides it, otherwise menu steps.
 *  - iPhone/iPad Safari: shown; opens Share -> Add to Home Screen instructions (iOS has no install API).
 *  - Never shown on desktop, in unsupported browsers, or once the app is installed / running standalone.
 */
export default function InstallApp() {
  const [sheet, setSheet] = useState(false);
  const [can, setCan] = useState(false);
  const [compact, setCompact] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const act = useRef<() => void>(() => {});

  useEffect(() => {
    const link = document.getElementById("install-app") as HTMLAnchorElement | null;
    if (!link || isStandalone()) return;

    let deferred: InstallEvent | null = null;
    const show = () => {
      link.removeAttribute("hidden");
      setCan(true);
    };
    const hide = () => {
      link.setAttribute("hidden", "");
      setCan(false);
    };

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
    const run = async () => {
      if (deferred) {
        const d = deferred;
        deferred = null;
        await d.prompt();
        const { outcome } = await d.userChoice;
        if (outcome === "accepted") hide();
        // If dismissed, keep the button: tapping it again shows the manual steps.
      } else {
        setSheet(true);
      }
    };

    const onClick = (e: Event) => {
      e.preventDefault();
      run();
    };
    act.current = run;

    // Mobile only: Android and iPhone/iPad. Desktop (Windows, macOS, Linux, ChromeOS) never gets an install option.
    const { ios, safari } = isIosSafari();
    const android = /Android/i.test(navigator.userAgent);
    if (ios && safari) {
      setPlatform("ios");
      show();
    } else if (android) {
      // Show the button even if Chrome has not fired the install event yet; fall back to menu instructions.
      setPlatform("android");
      show();
    } else {
      return;
    }

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
    // Collapse the pill to a round icon once the visitor scrolls, so it stays out of the way.
    const onScroll = () => setCompact(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <>
      {can && (
        <button type="button" className={compact ? "ins-fab c" : "ins-fab"} onClick={() => act.current()} aria-label="Download our mobile app">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ins-l">Download App</span>
        </button>
      )}
      {sheet && <InstallSheet platform={platform} onClose={() => setSheet(false)} />}
    </>
  );
}

function InstallSheet({ platform, onClose }: { platform: "ios" | "android"; onClose: () => void }) {
  if (platform === "android")
    return (
      <div className="ins-bg" role="presentation" onClick={() => onClose()}>
        <div className="ins" role="dialog" aria-modal="true" aria-labelledby="ins-t" onClick={(e) => e.stopPropagation()}>
          <h3 id="ins-t">Install Yordan on your phone</h3>
          <ol>
            <li>
              Open the browser menu <b>&#8942;</b> (top right) in Chrome.
            </li>
            <li>
              Tap <b>Install app</b> (or <b>Add to Home screen</b>).
            </li>
            <li>
              Tap <b>Install</b>. The app icon will appear on your home screen.
            </li>
          </ol>
          <button type="button" className="btn" onClick={() => onClose()}>
            Got it
          </button>
        </div>
      </div>
    );
  return (
    <div className="ins-bg" role="presentation" onClick={() => onClose()}>
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
        <button type="button" className="btn" onClick={() => onClose()}>
          Got it
        </button>
      </div>
    </div>
  );
}
