import { Domain } from "@/types";

const TIMEOUT_MS = 3500;

export const DOMAIN_FALLBACK_IMAGES: Record<Domain, string> = {
  anime: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
  movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
  books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  places: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
};

/**
 * 1. Fetch Anime cover image:
 * Primary: AniList GraphQL (Zero auth)
 * Secondary: Jikan (Unofficial MyAnimeList v4 API, Zero auth)
 */
export async function fetchAnimeCover(title: string): Promise<string | null> {
  // Tier 1: AniList GraphQL
  try {
    const gqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 1) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            coverImage {
              extraLarge
              large
            }
          }
        }
      }
    `;

    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "TasteMem/1.0",
      },
      body: JSON.stringify({ query: gqlQuery, variables: { search: title } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (res.ok) {
      const data = await res.json();
      const media = data?.data?.Page?.media?.[0];
      const img = media?.coverImage?.extraLarge || media?.coverImage?.large;
      if (img) return img;
    }
  } catch {
    // Fall through to Jikan
  }

  // Tier 2: Jikan API (MyAnimeList v4)
  try {
    const jikanRes = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (jikanRes.ok) {
      const jikanData = await jikanRes.json();
      const first = jikanData.data?.[0];
      const img = first?.images?.webp?.large_image_url || first?.images?.jpg?.large_image_url;
      if (img) return img;
    }
  } catch {
    // Return null
  }

  return null;
}

/**
 * 2. Fetch Music cover image:
 * Tier 1: iTunes Search API (HD 600x600)
 * Tier 2: Deezer Search API
 */
export async function fetchMusicCover(title: string): Promise<string | null> {
  try {
    const itunesRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=album&limit=1`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      const first = itunesData.results?.[0];
      if (first?.artworkUrl100) {
        return first.artworkUrl100.replace("100x100bb", "600x600bb");
      }
    }
  } catch {
    // Fall through to Deezer
  }

  try {
    const deezerRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(title)}&limit=1`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (deezerRes.ok) {
      const data = await deezerRes.json();
      const track = data?.data?.[0];
      return track?.album?.cover_xl || track?.album?.cover_medium || null;
    }
  } catch {
    // Return null
  }

  return null;
}

/**
 * 3. Fetch Movie/Cinema poster:
 * Tier 1: TMDB API (if key present in .env)
 * Tier 2: OMDb API (if key present in .env)
 * Tier 3: TVMaze API (100% Free, zero-auth, high-res posters)
 * Tier 4: iTunes Movie API
 */
export async function fetchMovieCover(title: string): Promise<string | null> {
  // Tier 1: TMDB
  const tmdbKey = process.env.TMDB_API_KEY;
  if (tmdbKey) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&page=1`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) }
      );
      if (res.ok) {
        const data = await res.json();
        const first = (data.results || []).find((i: any) => i.poster_path);
        if (first?.poster_path) {
          return `https://image.tmdb.org/t/p/w500${first.poster_path}`;
        }
      }
    } catch {
      // Fall through
    }
  }

  // Tier 2: OMDb
  const omdbKey = process.env.OMDB_API_KEY;
  if (omdbKey) {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(title)}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.Poster && data.Poster !== "N/A") {
          return data.Poster;
        }
      }
    } catch {
      // Fall through
    }
  }

  // Tier 3: TVMaze API (Zero-auth show/movie search with official HD images)
  try {
    const tvmazeRes = await fetch(
      `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (tvmazeRes.ok) {
      const data = await tvmazeRes.json();
      const img = data.image?.original || data.image?.medium;
      if (img) return img;
    }
  } catch {
    // Fall through
  }

  // Tier 4: iTunes Movie
  try {
    const itunesRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=movie&limit=1`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (itunesRes.ok) {
      const data = await itunesRes.json();
      const item = data.results?.[0];
      if (item?.artworkUrl100) {
        return item.artworkUrl100.replace("100x100bb", "600x600bb");
      }
    }
  } catch {
    // Return null
  }

  return null;
}

/**
 * 4. Fetch Book cover thumbnail:
 * Tier 1: Google Books API (uses GOOGLE_BOOKS_API_KEY or public endpoint)
 * Tier 2: Open Library Books API (100% Free, zero auth)
 */
export async function fetchBookCover(title: string): Promise<string | null> {
  const booksKey = process.env.GOOGLE_BOOKS_API_KEY;
  const keyParam = booksKey ? `&key=${booksKey}` : "";

  // Tier 1: Google Books
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1${keyParam}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (res.ok) {
      const data = await res.json();
      const info = data.items?.[0]?.volumeInfo;
      let thumb = info?.imageLinks?.thumbnail || info?.imageLinks?.smallThumbnail || null;
      if (thumb) {
        if (thumb.startsWith("http://")) thumb = thumb.replace("http://", "https://");
        return thumb;
      }
    }
  } catch {
    // Fall through
  }

  // Tier 2: iTunes Ebook
  try {
    const itunesBookRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=ebook&limit=1`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (itunesBookRes.ok) {
      const itunesData = await itunesBookRes.json();
      const first = itunesData.results?.[0];
      if (first?.artworkUrl100) {
        return first.artworkUrl100.replace("100x100bb", "600x600bb");
      }
    }
  } catch {
    // Fall through
  }

  // Tier 3: Open Library
  try {
    const olRes = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (olRes.ok) {
      const olData = await olRes.json();
      const doc = olData.docs?.[0];
      if (doc?.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }
  } catch {
    // Return null
  }

  return null;
}

/**
 * High-level artwork fallback pipeline: queries external service based on domain,
 * with multi-tier fallback to ensure visual discovery never breaks.
 */
export async function fetchArtworkFallback(title: string, domain: Domain): Promise<string> {
  let resolvedUrl: string | null = null;

  switch (domain) {
    case "anime":
      resolvedUrl = await fetchAnimeCover(title);
      break;
    case "music":
      resolvedUrl = await fetchMusicCover(title);
      break;
    case "movies":
      resolvedUrl = await fetchMovieCover(title);
      break;
    case "books":
      resolvedUrl = await fetchBookCover(title);
      break;
    case "places": {
      const lower = title.toLowerCase();
      if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("café") || lower.includes("roaster") || lower.includes("tea")) {
        resolvedUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80";
      } else if (lower.includes("bar") || lower.includes("cocktail") || lower.includes("lounge") || lower.includes("vinyl") || lower.includes("sound")) {
        resolvedUrl = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80";
      } else if (lower.includes("book") || lower.includes("library") || lower.includes("read")) {
        resolvedUrl = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80";
      } else if (lower.includes("museum") || lower.includes("gallery") || lower.includes("art")) {
        resolvedUrl = "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80";
      } else if (lower.includes("ramen") || lower.includes("restaurant") || lower.includes("bistro") || lower.includes("dining") || lower.includes("food") || lower.includes("sushi")) {
        resolvedUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80";
      } else {
        resolvedUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80";
      }
      break;
    }
    default:
      resolvedUrl = null;
      break;
  }

  return resolvedUrl || DOMAIN_FALLBACK_IMAGES[domain] || DOMAIN_FALLBACK_IMAGES.movies;
}
