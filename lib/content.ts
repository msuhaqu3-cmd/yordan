import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Reads a pre-split HTML fragment from /content at build/render time (server only). */
export function readContent(name: string): string {
  // HTML comments are authoring notes only; never ship them to visitors.
  return readFileSync(join(process.cwd(), "content", name), "utf8").replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
}
