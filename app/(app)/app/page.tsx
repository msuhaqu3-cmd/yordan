import { readContent } from "@/lib/content";
import AppBehaviour from "@/components/app-behaviour";

export default function AppPage() {
  const html = readContent("app.html");
  return (
    <>
      <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <AppBehaviour />
    </>
  );
}
