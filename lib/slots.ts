import generated from "./slots.generated.json";

export type WebSlot = { path: string; cssVars: string[]; inHtml: boolean; label: string; group: string };
export type Slot = { key: string; label: string; group: string; defaultUrl: string | null; hint?: string };

export const WEB_SLOTS = generated as WebSlot[];

const APP_PROJECTS: [string, string][] = [
  ["Bathrooms", "Walk-in shower"], ["Interiors", "Living room"], ["Bathrooms", "Tiled family bath"],
  ["On site", "Ceiling rewire"], ["Interiors", "Staircase"], ["Interiors", "Fitted kitchen"],
  ["Bathrooms", "Cloakroom"], ["On site", "Brick feature wall"], ["Interiors", "Under-stairs storage"],
  ["On site", "Exterior decking"],
];

export const APP_SLOTS: Slot[] = [
  { key: "app:before", label: "Before photo (slider)", group: "Mobile app · Before / After", defaultUrl: null, hint: "Shown on the left of the Projects slider" },
  { key: "app:after", label: "After photo (slider)", group: "Mobile app · Before / After", defaultUrl: null, hint: "Shown on the right of the Projects slider" },
  ...APP_PROJECTS.map(([cat, title], i) => ({
    key: `app:project:${i}`, label: `${cat} · ${title}`, group: "Mobile app · Gallery tiles", defaultUrl: null,
    hint: "Replaces the coloured placeholder tile",
  })),
];

export const webKey = (path: string) => `web:${path}`;

export const allSlots = (): Slot[] => [
  ...WEB_SLOTS.map((s) => ({ key: webKey(s.path), label: s.label, group: `Website · ${s.group}`, defaultUrl: `/${s.path}` })),
  ...APP_SLOTS,
];

export const VALID_SLOT = (k: string) => allSlots().some((s) => s.key === k);
