import { Shelf, ShelfItem, Vibe } from "@/types";

const STORAGE_KEY = "tastemem_shelves_v1";
const CANVAS_ITEMS_KEY = "tastemem_canvas_items_v1";
const VIBES_KEY = "tastemem_vibes_v1";

function triggerCloudSync(shelves: Shelf[], canvas?: ShelfItem[]) {
  if (typeof window === "undefined") return;
  import("./firebase/syncBridge").then(({ syncLocalChangesToCloud }) => {
    syncLocalChangesToCloud(shelves, canvas).catch((err) => {
      console.warn("TasteMem: Background cloud sync error", err);
    });
  }).catch(() => {});
}

export const CANONICAL_SEED_MAP: Record<string, string> = {
  "Spirited Away": "9B33A620-68CA-49B3-BFCF-F09CCF8AD595",
  "Cowboy Bebop": "6EBC0C74-90B9-4E45-941B-1BBAA521DA16",
  "Frieren: Beyond Journey's End": "C55D99C5-7A50-42FF-85E8-AB6C7FB937E7",
  "Blade Runner 2049": "3A02361C-987B-4F7E-9AAD-071C3853AD92",
  "Drive": "81AD2DF6-5C6E-4093-BF8A-A12EE901D6BE",
  "Texas Sun": "BAF6317A-DF94-4C90-92AE-63F86560C21B",
  "Loveless": "7B4EDC5A-9779-4338-88DA-D5C415385511",
};

export function getStoredShelves(): Shelf[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const shelves: Shelf[] = JSON.parse(raw);
    if (isLegacySeedShelves(shelves)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    let migrated = false;
    for (const shelf of shelves) {
      if (Array.isArray(shelf.items)) {
        for (const item of shelf.items) {
          if (!item.qlooEntityId && CANONICAL_SEED_MAP[item.title]) {
            item.qlooEntityId = CANONICAL_SEED_MAP[item.title];
            migrated = true;
          }
        }
      }
    }
    if (migrated) {
      saveStoredShelves(shelves);
    }
    return shelves;
  } catch {
    return [];
  }
}

export function saveStoredShelves(shelves: Shelf[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves));
    triggerCloudSync(shelves);
  } catch (err) {
    console.error("Failed to save shelves to localStorage", err);
  }
}

export function getStoredCanvasItems(): ShelfItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CANVAS_ITEMS_KEY);
    if (!raw) return [];
    const items: ShelfItem[] = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveStoredCanvasItems(items: ShelfItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CANVAS_ITEMS_KEY, JSON.stringify(items));
    triggerCloudSync(getStoredShelves(), items);
  } catch (err) {
    console.error("Failed to save canvas items to localStorage", err);
  }
}

export function getStoredVibes(): Vibe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VIBES_KEY);
    if (!raw) return [];
    const vibes: Vibe[] = JSON.parse(raw);
    return Array.isArray(vibes) ? vibes : [];
  } catch {
    return [];
  }
}

export function saveStoredVibes(vibes: Vibe[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIBES_KEY, JSON.stringify(vibes));
  } catch (err) {
    console.error("Failed to save vibes to localStorage", err);
  }
}

export function exportShelvesToJson(shelves: Shelf[]): void {
  if (typeof window === "undefined") return;
  const jsonStr = JSON.stringify(shelves, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tastemem_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetToSeedShelves(): Shelf[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return [];
}

function isLegacySeedShelves(shelves: Shelf[]): boolean {
  const seedShelfIds = ["anime-favorites", "cinema-records", "vinyl-rotation"];
  const seedItemIds = ["item-1", "item-2", "item-3", "item-4", "item-5", "item-6", "item-7"];
  return shelves.length === seedShelfIds.length
    && shelves.every((shelf) => seedShelfIds.includes(shelf.id))
    && shelves.flatMap((shelf) => shelf.items).length === seedItemIds.length
    && shelves.flatMap((shelf) => shelf.items).every((item) => seedItemIds.includes(item.id));
}
