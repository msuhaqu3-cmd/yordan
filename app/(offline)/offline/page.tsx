import RetryButton from "./retry-button";

export default function OfflinePage() {
  return (
    <main>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.webp" alt="Yordan Decorations & Building Ltd" width={200} height={122} />
      <h1>You&rsquo;re offline</h1>
      <p>
        We can&rsquo;t reach the internet right now. Check your connection and try again, or call us directly for a
        free quote.
      </p>
      <RetryButton />
      <a className="o" href="tel:+447846292529">
        Call 07846 292529
      </a>
    </main>
  );
}
