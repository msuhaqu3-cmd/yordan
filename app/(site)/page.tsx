import { readContent } from "@/lib/content";
import { applyTokens } from "@/lib/settings";
import { applyWebMedia, clientConfig, getSiteData, mediaCss } from "@/lib/site-data";
import HomeBehaviour from "@/components/home-behaviour";

// Re-generated at most once a minute, and immediately when the admin saves changes.
export const revalidate = 60;

export default async function HomePage() {
  const d = await getSiteData();
  const html = applyTokens(applyWebMedia(readContent("home.html"), d.webMedia), d.vars);
  const css = mediaCss(d.webMedia);
  return (
    <>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      {/* display:contents keeps the DOM layout identical to the original static page */}
      <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <script dangerouslySetInnerHTML={{ __html: clientConfig(d) }} />
      <HomeBehaviour />
    </>
  );
}
