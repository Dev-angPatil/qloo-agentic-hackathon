import { Domain } from "@/types";

const TIMEOUT_MS = 2500;

export const DOMAIN_FALLBACK_IMAGES: Record<Domain, string> = {
  anime: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
  movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
  books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  places: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
};

/**
 * Fetch Anime cover image from AniList GraphQL (zero auth, User-Agent header)
 */
export async function fetchAnimeCover(title: string): Promise<string | null> {
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

    if (!res.ok) return null;
    const data = await res.json();
    const media = data?.data?.Page?.media?.[0];
    return media?.coverImage?.extraLarge || media?.coverImage?.large || null;
  } catch {
    return null;
  }
}

/**
 * Fetch Music cover image from iTunes Album search with Deezer fallback
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
 * Fetch Movie/Cinema poster from TMDB (if key present) or iTunes Movie API
 */
export async function fetchMovieCover(title: string): Promise<string | null> {
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
      // Fall through to iTunes Movie
    }
  }

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
 * Fetch Book cover thumbnail from Google Books API
 */
export async function fetchBookCover(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (res.ok) {
      const data = await res.json();
      const info = data.items?.[0]?.volumeInfo;
      let thumb = info?.imageLinks?.thumbnail || info?.imageLinks?.smallThumbnail || null;
      if (thumb && thumb.startsWith("http://")) {
        thumb = thumb.replace("http://", "https://");
      }
      return thumb;
    }
  } catch {
    // Return null
  }

  return null;
}

/**
 * High-level artwork fallback pipeline: queries external service based on domain,
 * and falls back to curated monochrome/atmospheric Unsplash photography if unresolvable.
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
