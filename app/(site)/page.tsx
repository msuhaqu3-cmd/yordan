import { readContent } from "@/lib/content";
import HomeBehaviour from "@/components/home-behaviour";

export default function HomePage() {
  const html = readContent("home.html");
  return (
    <>
      {/* display:contents keeps the DOM layout identical to the original static page */}
      <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <HomeBehaviour />
    </>
  );
}
