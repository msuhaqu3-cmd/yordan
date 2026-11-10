import { readContent } from "@/lib/content";
import { applyTokens } from "@/lib/settings";
import { clientConfig, getSiteData } from "@/lib/site-data";
import AppBehaviour from "@/components/app-behaviour";

export const revalidate = 60;

export default async function AppPage() {
  const d = await getSiteData();
  const html = applyTokens(readContent("app.html"), d.vars);
  return (
    <>
      <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <script dangerouslySetInnerHTML={{ __html: clientConfig(d, "app") }} />
      <AppBehaviour />
    </>
  );
}
