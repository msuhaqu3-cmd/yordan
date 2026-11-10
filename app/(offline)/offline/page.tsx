import RetryButton from "./retry-button";
import { getSiteData } from "@/lib/site-data";

export const revalidate = 300;

export default async function OfflinePage() {
  const { vars } = await getSiteData();
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
      <a className="o" href={`tel:${vars.TEL}`}>
        Call {vars.PHONE}
      </a>
    </main>
  );
}
