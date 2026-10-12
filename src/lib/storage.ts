import { Shelf, ShelfItem } from "@/types";

const STORAGE_KEY = "tastemem_shelves_v1";

export const SEED_SHELVES: Shelf[] = [
  {
    id: "anime-favorites",
    title: "Anime Vault",
    domain: "anime",
    itemCount: 3,
    createdAt: new Date().toISOString(),
    position: { x: 0, y: 0 },
    items: [
      {
        id: "item-1",
        shelfId: "anime-favorites",
        title: "Spirited Away",
        subtitle: "Hayao Miyazaki",
        coverImageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx199-522pfnUuR6iT.png",
        description: "Chihiro stumbles into a magical world ruled by spirits and a bathhouse witch.",
        userNote: "Comfort watch on rainy nights. The soundtrack gives me chills.",
        domain: "anime",
        year: "2001",
        createdAt: new Date().toISOString(),
      },
      {
        id: "item-2",
        shelfId: "anime-favorites",
        title: "Cowboy Bebop",
        subtitle: "Shinichiro Watanabe",
        coverImageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-CXtrrkMpJ8ig.png",
        description: "Bounty hunters drifting through the solar system accompanied by bebop jazz.",
        userNote: "Peak 90s aesthetic. Episode 5 ballad of fallen angels is perfection.",
        domain: "anime",
        year: "1998",
        createdAt: new Date().toISOString(),
      },
      {
        id: "item-3",
        shelfId: "anime-favorites",
        title: "Frieren: Beyond Journey's End",
        subtitle: "Keiichiro Saito",
        coverImageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n1HJZcLnmA4W.jpg",
        description: "An immortal elf mage reflects on human connections after the demon king is slain.",
        userNote: "Meditative and profoundly touching meditation on memory.",
        domain: "anime",
        year: "2023",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "cinema-records",
    title: "Late Night Cinema",
    domain: "movies",
    itemCount: 2,
    createdAt: new Date().toISOString(),
    position: { x: 0, y: 0 },
    items: [
      {
        id: "item-4",
        shelfId: "cinema-records",
        title: "Blade Runner 2049",
        subtitle: "Denis Villeneuve",
        coverImageUrl: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        description: "Young blade runner K's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
        userNote: "Roger Deakins cinematography is unmatched. The scale and atmosphere.",
        domain: "movies",
        year: "2017",
        createdAt: new Date().toISOString(),
      },
      {
        id: "item-5",
        shelfId: "cinema-records",
        title: "Drive",
        subtitle: "Nicolas Winding Refn",
        coverImageUrl: "https://image.tmdb.org/t/p/w500/602vevIURmpENz40cu690AwWBqO.jpg",
        description: "A mysterious Hollywood stuntman and mechanic who moonlights as a getaway driver finds himself in trouble.",
        userNote: "The neon night driving scenes and synth-wave score.",
        domain: "movies",
        year: "2011",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "vinyl-rotation",
    title: "Vinyl & Shoegaze",
    domain: "music",
    itemCount: 2,
    createdAt: new Date().toISOString(),
    position: { x: 0, y: 0 },
    items: [
      {
        id: "item-6",
        shelfId: "vinyl-rotation",
        title: "Texas Sun",
        subtitle: "Khruangbin & Leon Bridges",
        coverImageUrl: "https://e-cdns-images.dzcdn.net/images/cover/b4ef84c4f03930b050d5351aee979b90/500x500-000000-80-0-0.jpg",
        description: "Groovy psychedelic soul fusion celebrating wide open Texas highways.",
        userNote: "Warm analog bassline, morning coffee ritual staple.",
        domain: "music",
        year: "2020",
        createdAt: new Date().toISOString(),
      },
      {
        id: "item-7",
        shelfId: "vinyl-rotation",
        title: "Loveless",
        subtitle: "My Bloody Valentine",
        coverImageUrl: "https://e-cdns-images.dzcdn.net/images/cover/c7aa0c184285b73d84381e4b857502bf/500x500-000000-80-0-0.jpg",
        description: "The definitive shoegaze monument with glide guitar wall of sound.",
        userNote: "Hypnotic dream noise. Sounds like melted sunlight.",
        domain: "music",
        year: "1991",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

export function getStoredShelves(): Shelf[] {
  if (typeof window === "undefined") return SEED_SHELVES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SHELVES));
      return SEED_SHELVES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_SHELVES;
  }
}

export function saveStoredShelves(shelves: Shelf[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves));
  } catch (err) {
    console.error("Failed to save shelves to localStorage", err);
  }
}
