import { NextRequest, NextResponse } from "next/server";
import { DOMAIN_FALLBACK_IMAGES } from "@/lib/metadataFallback";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "anime";
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    // ------------------------------------------------------------------
    // 1. ANIME: AniList GraphQL -> Jikan (MyAnimeList v4) fallback
    // ------------------------------------------------------------------
    if (domain === "anime") {
      try {
        const gqlQuery = `
          query ($search: String) {
            Page(page: 1, perPage: 8) {
              media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
                id
                title {
                  english
                  romaji
                }
                description(asHtml: false)
                coverImage {
                  extraLarge
                  large
                }
                startDate {
                  year
                }
                genres
              }
            }
          }
        `;

        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "TasteMem/1.0" },
          body: JSON.stringify({ query: gqlQuery, variables: { search: query } }),
          signal: AbortSignal.timeout(4000),
        });

        if (response.ok) {
          const data = await response.json();
          const mediaList = data?.data?.Page?.media || [];
          if (mediaList.length > 0) {
            const results = mediaList.map((m: any) => ({
              title: m.title.english || m.title.romaji,
              subtitle: m.title.romaji !== m.title.english ? m.title.romaji : m.genres?.slice(0, 2).join(", "),
              coverImageUrl: m.coverImage?.extraLarge || m.coverImage?.large,
              description: m.description ? m.description.replace(/<[^>]*>?/gm, "").slice(0, 240) + "..." : "",
              domain: "anime",
              year: m.startDate?.year ? String(m.startDate.year) : undefined,
              externalId: String(m.id),
            }));
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through to Jikan
      }

      // Jikan (MAL) Fallback
      try {
        const jikanRes = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (jikanRes.ok) {
          const jikanData = await jikanRes.json();
          const list = jikanData.data || [];
          if (list.length > 0) {
            const results = list.map((a: any) => ({
              title: a.title_english || a.title,
              subtitle: a.title_japanese || a.genres?.map((g: any) => g.name).slice(0, 2).join(", "),
              coverImageUrl: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url,
              description: a.synopsis ? a.synopsis.slice(0, 240) + "..." : "",
              domain: "anime",
              year: a.year ? String(a.year) : undefined,
              externalId: String(a.mal_id),
            }));
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }
    }

    // ------------------------------------------------------------------
    // 2. MUSIC: iTunes -> Deezer fallback
    // ------------------------------------------------------------------
    if (domain === "music") {
      try {
        const itunesRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=8`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          const items = itunesData.results || [];
          if (items.length > 0) {
            const results = items.map((a: any) => ({
              title: a.collectionName,
              subtitle: a.artistName,
              coverImageUrl: (a.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
              description: `${a.primaryGenreName || "Music"} • ${a.trackCount || 0} tracks`,
              domain: "music",
              year: a.releaseDate ? a.releaseDate.slice(0, 4) : undefined,
              externalId: String(a.collectionId),
            }));
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }

      // Deezer fallback
      try {
        const response = await fetch(
          `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=8`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (response.ok) {
          const data = await response.json();
          const tracks = data?.data || [];
          const results = tracks.map((t: any) => ({
            title: t.title,
            subtitle: t.artist?.name,
            coverImageUrl: t.album?.cover_xl || t.album?.cover_medium,
            description: `Album: ${t.album?.title || "Single"} by ${t.artist?.name}`,
            domain: "music",
            year: t.release_date ? t.release_date.split("-")[0] : undefined,
            externalId: String(t.id),
          }));
          return NextResponse.json({ results });
        }
      } catch {
        // Fall through
      }
    }

    // ------------------------------------------------------------------
    // 3. MOVIES: TMDB -> TVMaze (Free) -> OMDb -> iTunes fallback
    // ------------------------------------------------------------------
    if (domain === "movies") {
      const tmdbKey = process.env.TMDB_API_KEY;
      if (tmdbKey) {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&page=1`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (res.ok) {
            const data = await res.json();
            const items = (data.results || []).filter((i: any) => i.poster_path).slice(0, 8);
            if (items.length > 0) {
              const results = items.map((i: any) => ({
                title: i.title || i.name,
                subtitle: (i.media_type === "tv" ? "TV Series" : "Feature Film") + (i.release_date ? ` (${i.release_date.slice(0, 4)})` : ""),
                coverImageUrl: `https://image.tmdb.org/t/p/w500${i.poster_path}`,
                description: i.overview?.slice(0, 240) + "...",
                domain: "movies",
                year: (i.release_date || i.first_air_date || "").slice(0, 4),
                externalId: String(i.id),
              }));
              return NextResponse.json({ results });
            }
          }
        } catch {
          // Fall through
        }
      }

      // TVMaze Search (100% Free, zero-auth, high-res posters)
      try {
        const tvmazeRes = await fetch(
          `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (tvmazeRes.ok) {
          const shows = await tvmazeRes.json();
          const itemsWithImages = (shows || []).filter((s: any) => s.show?.image?.original || s.show?.image?.medium).slice(0, 8);
          if (itemsWithImages.length > 0) {
            const results = itemsWithImages.map((s: any) => {
              const show = s.show;
              return {
                title: show.name,
                subtitle: show.genres?.slice(0, 2).join(", ") || (show.premiered ? `Premiered ${show.premiered.slice(0, 4)}` : "Cinema"),
                coverImageUrl: show.image?.original || show.image?.medium,
                description: show.summary ? show.summary.replace(/<[^>]*>?/gm, "").slice(0, 240) + "..." : "",
                domain: "movies",
                year: show.premiered ? show.premiered.slice(0, 4) : undefined,
                externalId: String(show.id),
              };
            });
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }

      // iTunes Movie Search Fallback
      try {
        const itunesRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=8`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (itunesRes.ok) {
          const data = await itunesRes.json();
          const items = data.results || [];
          if (items.length > 0) {
            const results = items.map((i: any) => ({
              title: i.trackName,
              subtitle: `${i.primaryGenreName || "Cinema"} • ${i.artistName}`,
              coverImageUrl: (i.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
              description: i.longDescription?.slice(0, 240) + "..." || "",
              domain: "movies",
              year: i.releaseDate ? i.releaseDate.slice(0, 4) : undefined,
              externalId: String(i.trackId),
            }));
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }
    }

    // ------------------------------------------------------------------
    // 4. BOOKS: Google Books -> Open Library fallback
    // ------------------------------------------------------------------
    if (domain === "books") {
      const booksKey = process.env.GOOGLE_BOOKS_API_KEY;
      const keyParam = booksKey ? `&key=${booksKey}` : "";

      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8${keyParam}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          const results = items
            .map((b: any) => {
              const info = b.volumeInfo || {};
              let thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
              if (thumb.startsWith("http://")) thumb = thumb.replace("http://", "https://");
              return {
                title: info.title,
                subtitle: (info.authors || []).join(", "),
                coverImageUrl: thumb,
                description: info.description?.slice(0, 240) + "..." || "",
                domain: "books",
                year: info.publishedDate ? info.publishedDate.slice(0, 4) : undefined,
                externalId: b.id,
              };
            })
            .filter((b: any) => b.coverImageUrl);

          if (results.length > 0) {
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }

      // iTunes Ebook Search (100% Free, Zero Auth, Official High-Res Covers)
      try {
        const itunesBookRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=8`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (itunesBookRes.ok) {
          const itunesData = await itunesBookRes.json();
          const items = itunesData.results || [];
          if (items.length > 0) {
            const results = items.map((b: any) => ({
              title: b.trackName,
              subtitle: b.artistName || "Author",
              coverImageUrl: (b.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
              description: b.description ? b.description.replace(/<[^>]*>?/gm, "").slice(0, 240) + "..." : "Literature",
              domain: "books",
              year: b.releaseDate ? b.releaseDate.slice(0, 4) : undefined,
              externalId: String(b.trackId),
            }));
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }

      // Open Library fallback
      try {
        const olRes = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (olRes.ok) {
          const olData = await olRes.json();
          const docs = olData.docs || [];
          const results = docs
            .filter((d: any) => d.cover_i)
            .map((d: any) => ({
              title: d.title,
              subtitle: (d.author_name || []).slice(0, 2).join(", "),
              coverImageUrl: `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`,
              description: d.first_sentence?.[0] || (d.first_publish_year ? `First published in ${d.first_publish_year}` : "Book"),
              domain: "books",
              year: d.first_publish_year ? String(d.first_publish_year) : undefined,
              externalId: d.key,
            }));
          if (results.length > 0) {
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }
    }

    // ------------------------------------------------------------------
    // 5. PLACES: Qloo Places Search -> Photon OSM fallback
    // ------------------------------------------------------------------
    if (domain === "places") {
      const apiKey = process.env.QLOO_API_KEY;
      if (apiKey) {
        try {
          const qlooUrl = `https://hackathon.api.qloo.com/search?query=${encodeURIComponent(query)}&types=urn:entity:place&take=8`;
          const res = await fetch(qlooUrl, {
            headers: {
              "X-Api-Key": apiKey,
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const data = await res.json();
            const items = data.results || [];
            if (items.length > 0) {
              const results = items.map((p: any) => {
                const tagNames = Array.isArray(p.tags)
                  ? p.tags.slice(0, 2).map((t: any) => t?.name).filter(Boolean).join(" • ")
                  : "";
                const img =
                  p.properties?.image?.url ||
                  p.properties?.photos?.[0]?.url ||
                  DOMAIN_FALLBACK_IMAGES.places;
                return {
                  title: p.name,
                  subtitle: p.disambiguation || tagNames || "Cultural Sanctuary",
                  coverImageUrl: img,
                  description: p.disambiguation ? `Location: ${p.disambiguation}` : "Curated place and cultural haven",
                  domain: "places",
                  externalId: p.entity_id,
                };
              });
              return NextResponse.json({ results });
            }
          }
        } catch {
          // Fall through
        }
      }

      // Free, zero-auth fallback via Photon (OpenStreetMap)
      try {
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (photonRes.ok) {
          const data = await photonRes.json();
          const features = data.features || [];
          const results = features
            .map((f: any) => {
              const props = f.properties || {};
              const city = props.city || props.town || props.state || "";
              const country = props.country || "";
              const loc = [city, country].filter(Boolean).join(", ");
              return {
                title: props.name || query,
                subtitle: loc || props.osm_value || "Place",
                coverImageUrl: DOMAIN_FALLBACK_IMAGES.places,
                description: loc ? `Located in ${loc}` : "Cultural spot",
                domain: "places",
                externalId: String(props.osm_id || Math.random()),
              };
            })
            .filter((f: any) => f.title);
          if (results.length > 0) {
            return NextResponse.json({ results });
          }
        }
      } catch {
        // Fall through
      }
    }

    return NextResponse.json({ results: [] });
  } catch (err: any) {
    console.error("Search route error:", err);
    return NextResponse.json({ results: [], error: err.message }, { status: 500 });
  }
}
