import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Reads a pre-split HTML fragment from /content at build/render time (server only). */
export function readContent(name: string): string {
  return readFileSync(join(process.cwd(), "content", name), "utf8");
}
