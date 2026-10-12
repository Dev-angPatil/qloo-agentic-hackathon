import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "anime";
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    if (domain === "anime") {
      // Query AniList GraphQL API (100% Free, Zero Auth)
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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: gqlQuery, variables: { search: query } }),
      });

      if (!response.ok) {
        return NextResponse.json({ results: [] });
      }

      const data = await response.json();
      const mediaList = data?.data?.Page?.media || [];

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

    if (domain === "music") {
      // Query iTunes Album Search API (100% Free, Zero Auth, Official 600x600 Cover Art)
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=8`
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

      // Deezer fallback
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=8`);
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
    }

    if (domain === "movies") {
      // Check for TMDB key or fallback to iTunes Movie API (100% Free, zero-auth, official high-res posters)
      const tmdbKey = process.env.TMDB_API_KEY;
      if (tmdbKey) {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&page=1`
        );
        if (res.ok) {
          const data = await res.json();
          const items = (data.results || []).filter((i: any) => i.poster_path).slice(0, 8);
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

      // iTunes Movie Search Fallback (Zero auth, reliable)
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=8`);
      if (itunesRes.ok) {
        const data = await itunesRes.json();
        const items = data.results || [];
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

    if (domain === "books") {
      // Google Books API (Free, high-res covers & synopses)
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        const results = items.map((b: any) => {
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
        }).filter((b: any) => b.coverImageUrl);
        return NextResponse.json({ results });
      }
    }

    return NextResponse.json({ results: [] });
  } catch (err: any) {
    console.error("Search route error:", err);
    return NextResponse.json({ results: [], error: err.message }, { status: 500 });
  }
}
