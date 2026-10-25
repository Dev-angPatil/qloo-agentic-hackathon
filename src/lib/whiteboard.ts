import type { Domain, MemoryStyle, Shelf, ShelfItem, Vibe, VibeBorder, VibeStyle, VibeTexture } from "@/types";

export const BOARD_COLORS = ["#f7d154", "#f4a6b8", "#9fd8cb", "#b9c8f5", "#f3b27a"];
export const MEMORY_TONE_COLORS = { sun: "#f8dc74", rose: "#ffc6cf", mint: "#bde4d4", sky: "#cad7ff", lavender: "#d9c9f4" } as const;

export function getMemoryToneColor(tone?: string): string {
  if (tone && tone in MEMORY_TONE_COLORS) return MEMORY_TONE_COLORS[tone as keyof typeof MEMORY_TONE_COLORS];
  return MEMORY_TONE_COLORS.sun;
}

export function normalizeMemoryStyle(style?: string): MemoryStyle {
  if (style === "sticky" || style === "vinyl" || style === "record") return style;
  return "post-it";
}

export function normalizeVibeStyle(style?: string): VibeStyle {
  if (style === "blackboard" || style === "sheet") return style;
  return "paper";
}

export function normalizeVibeBorder(border?: string): VibeBorder {
  if (border === "dashed" || border === "hand-drawn") return border;
  return "solid";
}

export function normalizeVibeTexture(texture?: string): VibeTexture {
  if (texture === "paper-grain" || texture === "chalk" || texture === "grid") return texture;
  return "none";
}

export function getVibeItemPosition(item: ShelfItem, vibe?: Vibe): { x: number; y: number } {
  const position = item.position || { x: 0, y: 0 };
  if (!vibe || item.vibeId !== vibe.id) return position;
  return { x: vibe.position.x + position.x, y: vibe.position.y + position.y };
}

export interface VibeBoundaryMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
  path: string;
}

function getConvexHull(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length <= 2) return sorted;
  const cross = (origin: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
  const lower: Array<{ x: number; y: number }> = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper: Array<{ x: number; y: number }> = [];
  for (const point of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function getSmoothClosedPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 3) return "M 0 0 C 0 0 1 1 2 0 C 1 -1 0 0 0 0 Z";
  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = midpoint(points[points.length - 1], points[0]);
  let path = `M ${start.x} ${start.y}`;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const nextMidpoint = midpoint(current, next);
    path += ` Q ${current.x} ${current.y} ${nextMidpoint.x} ${nextMidpoint.y}`;
  }
  return `${path} Z`;
}

export function getVibeBoundaryMetrics(vibe: Vibe, items: ShelfItem[]): VibeBoundaryMetrics {
  const fallbackWidth = Math.max(420, vibe.size.width);
  const fallbackHeight = Math.max(280, vibe.size.height);
  if (items.length === 0) {
    const wobble = Math.min(24, Math.max(10, fallbackWidth / 30));
    const path = `M ${wobble} 74 C ${fallbackWidth * 0.16} ${wobble}, ${fallbackWidth * 0.37} 0, ${fallbackWidth * 0.56} ${wobble * 0.4} C ${fallbackWidth * 0.82} -8, ${fallbackWidth - wobble} ${fallbackHeight * 0.14}, ${fallbackWidth - 18} ${fallbackHeight * 0.44} C ${fallbackWidth + 5} ${fallbackHeight * 0.72}, ${fallbackWidth * 0.78} ${fallbackHeight + 8}, ${fallbackWidth * 0.5} ${fallbackHeight - 12} C ${fallbackWidth * 0.24} ${fallbackHeight + 7}, -8 ${fallbackHeight * 0.78}, ${18} ${fallbackHeight * 0.46} C ${4} ${fallbackHeight * 0.28}, ${-8} ${fallbackHeight * 0.12}, ${wobble} 74 Z`;
    return { left: 0, top: 0, width: fallbackWidth, height: fallbackHeight, path };
  }

  const points = items.flatMap((item, index) => {
    const position = item.position || { x: 80 + (index % 3) * 210, y: 90 + Math.floor(index / 3) * 190 };
    const itemWidth = 220;
    const itemHeight = item.memoryType === "media" ? 270 : 210;
    return [
      { x: position.x - 70, y: position.y - 82 },
      { x: position.x + itemWidth, y: position.y - 58 },
      { x: position.x + itemWidth + 62, y: position.y + itemHeight },
      { x: position.x - 58, y: position.y + itemHeight + 58 },
    ];
  });
  points.push({ x: -20, y: -16 }, { x: 260, y: -16 });
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const contentWidth = Math.max(420, maxX - minX);
  const contentHeight = Math.max(280, maxY - minY);
  const width = Math.max(fallbackWidth, contentWidth);
  const height = Math.max(fallbackHeight, contentHeight);
  const hull = getConvexHull(points).map((point) => ({
    x: ((point.x - minX) / contentWidth) * width,
    y: ((point.y - minY) / contentHeight) * height,
  }));
  return { left: minX, top: minY, width, height, path: getSmoothClosedPath(hull) };
}

export function suggestRecordFromNote(note: string): { title: string; domain: Domain } | null {
  const matchers: Array<{ domain: Domain; pattern: RegExp }> = [
    { domain: "anime", pattern: /\banime\b|\bepisode\b|\bmanga\b/i },
    { domain: "movies", pattern: /\bmovie\b|\bfilm\b|\bwatched\b|\bdirector\b/i },
    { domain: "music", pattern: /\balbum\b|\bsong\b|\blistening\b|\bsoundtrack\b/i },
    { domain: "books", pattern: /\bbook\b|\bnovel\b|\breading\b|\bauthor\b/i },
    { domain: "places", pattern: /\bcafe\b|\bcafé\b|\brestaurant\b|\bplace\b/i },
  ];
  const match = matchers.find(({ pattern }) => pattern.test(note));
  if (!match) return null;

  const title = note
    .replace(/^(i |my |just |really )/i, "")
    .split(/[.!?\n]/)[0]
    .trim()
    .slice(0, 60);
  return title ? { title, domain: match.domain } : null;
}

export function getBoardPosition(index: number, total: number): { x: number; y: number; rotate: number } {
  const columns = total > 5 ? 3 : total > 2 ? 2 : Math.max(total, 1);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const center = (columns - 1) / 2;

  return {
    x: (column - center) * 350 + (row % 2 === 0 ? -24 : 34),
    y: row * 260 + (column % 2 === 0 ? 18 : -14),
    rotate: [-2.5, 1.5, -1, 2][index % 4],
  };
}

export function getChapterLabel(shelf: Shelf): string {
  const count = shelf.items.length;
  if (count === 0) return "a blank page waiting";
  if (count === 1) return "one thing worth keeping";
  return `${count} things tied to the same feeling`;
}

export function getMemoryItems(shelves: Shelf[]): ShelfItem[] {
  return shelves.flatMap((shelf) => shelf.items.filter((item) => item.memoryType === "memory" || Boolean(item.userNote)));
}

export function getMediaItems(shelf: Shelf): ShelfItem[] {
  return shelf.items.filter((item) => item.memoryType !== "memory" && !item.userNote);
}
