import assert from "node:assert/strict";
import { getBoardPosition, getChapterLabel, getMemoryItems, getMediaItems, getMemoryToneColor, getVibeBoundaryMetrics, getVibeItemPosition, normalizeMemoryStyle, normalizeVibeBorder, normalizeVibeStyle, normalizeVibeTexture, suggestRecordFromNote } from "../src/lib/whiteboard.ts";

const shelves = [
  {
    id: "one",
    title: "Morning Air",
    domain: "places",
    itemCount: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    items: [
      { id: "a", shelfId: "one", title: "River fog", coverImageUrl: "", domain: "places", userNote: "The fog felt like a reset.", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "b", shelfId: "one", title: "An album", coverImageUrl: "cover", domain: "music", memoryType: "media", createdAt: "2026-01-01T00:00:00.000Z" },
    ],
  },
];

assert.deepEqual(getBoardPosition(0, 3), { x: -199, y: 18, rotate: -2.5 });
assert.equal(getChapterLabel(shelves[0]), "2 things tied to the same feeling");
assert.equal(getMemoryItems(shelves).length, 1);
assert.equal(getMediaItems(shelves[0]).length, 1);
assert.equal(normalizeMemoryStyle("vinyl"), "vinyl");
assert.equal(normalizeMemoryStyle("sticky"), "sticky");
assert.equal(normalizeMemoryStyle("unknown"), "post-it");
assert.equal(normalizeMemoryStyle(), "post-it");
assert.equal(getMemoryToneColor("rose"), "#ffc6cf");
assert.equal(getMemoryToneColor("unknown"), "#f8dc74");
assert.equal(normalizeVibeStyle("blackboard"), "blackboard");
assert.equal(normalizeVibeStyle("unknown"), "paper");
assert.equal(normalizeVibeBorder("hand-drawn"), "hand-drawn");
assert.equal(normalizeVibeTexture("chalk"), "chalk");
assert.deepEqual(getVibeItemPosition({ id: "n", shelfId: "__canvas__", vibeId: "v1", position: { x: 40, y: 30 } }, { id: "v1", title: "Vibe", color: "#fff", opacity: 0.5, border: "solid", texture: "none", style: "paper", position: { x: 100, y: 200 }, size: { width: 300, height: 200 }, createdAt: "2026-01-01T00:00:00.000Z" }), { x: 140, y: 230 });
const vibe = { id: "v1", title: "Vibe", color: "#fff", opacity: 0.5, border: "solid", texture: "none", style: "paper", position: { x: 0, y: 0 }, size: { width: 420, height: 280 }, createdAt: "2026-01-01T00:00:00.000Z" };
const emptyBoundary = getVibeBoundaryMetrics(vibe, []);
const populatedBoundary = getVibeBoundaryMetrics(vibe, [{ id: "n", shelfId: "__canvas__", vibeId: "v1", position: { x: 500, y: 100 }, title: "Note", coverImageUrl: "", domain: "places", createdAt: "2026-01-01T00:00:00.000Z" }]);
assert.ok(emptyBoundary.path.includes("C"));
assert.ok(populatedBoundary.width >= emptyBoundary.width);
assert.notEqual(populatedBoundary.path, emptyBoundary.path);
assert.deepEqual(suggestRecordFromNote("A movie I watched last night"), { title: "A movie I watched last night", domain: "movies" });
assert.equal(suggestRecordFromNote("A quiet morning thought"), null);
console.log("Whiteboard model checks passed");
