import { NextRequest, NextResponse } from "next/server";
import {
  Domain,
  RecommendationItem,
  RecommendationMode,
  RecommendationsApiResponse,
} from "@/types";
import { fetchArtworkFallback, DOMAIN_FALLBACK_IMAGES } from "@/lib/metadataFallback";
import { CANONICAL_SEED_MAP } from "@/lib/storage";
import dns from "node:dns";

export const dynamic = "force-dynamic";

// Optimize DNS resolution for hackathon.api.qloo.com
if (typeof dns !== "undefined" && typeof (dns as any).lookup === "function") {
  const origLookup = (dns as any).lookup;
  (dns as any).lookup = (hostname: string, options: any, callback: any) => {
    let cb = callback;
    let opts = options;
    if (typeof opts === "function") {
      cb = opts;
      opts = {};
    }
    if (hostname === "hackathon.api.qloo.com") {
      if (opts && opts.all) {
        return cb(null, [
          { address: "35.169.47.101", family: 4 },
          { address: "52.201.196.214", family: 4 },
          { address: "50.16.80.199", family: 4 },
        ]);
      }
      return cb(null, "35.169.47.101", 4);
    }
    return origLookup(hostname, opts, cb);
  };
}

const QLOO_BASE_URL = "https://hackathon.api.qloo.com";

// City to WKT bounding box polygon mapping (Verified against Qloo Places Graph)
const CITY_POLYGONS: Record<string, { name: string; polygon: string }> = {
  tokyo: {
    name: "Tokyo",
    polygon: "POLYGON((139.5 35.5, 139.9 35.5, 139.9 35.8, 139.5 35.8, 139.5 35.5))",
  },
  kyoto: {
    name: "Kyoto",
    polygon: "POLYGON((135.65 34.90, 135.85 34.90, 135.85 35.10, 135.65 35.10, 135.65 34.90))",
  },
  london: {
    name: "London",
    polygon: "POLYGON((-0.35 51.35, 0.15 51.35, 0.15 51.65, -0.35 51.65, -0.35 51.35))",
  },
  paris: {
    name: "Paris",
    polygon: "POLYGON((2.20 48.75, 2.45 48.75, 2.45 48.95, 2.20 48.95, 2.20 48.75))",
  },
  newyork: {
    name: "New York",
    polygon: "POLYGON((-74.1 40.6, -73.8 40.6, -73.8 40.9, -74.1 40.9, -74.1 40.6))",
  },
  nyc: {
    name: "New York",
    polygon: "POLYGON((-74.1 40.6, -73.8 40.6, -73.8 40.9, -74.1 40.9, -74.1 40.6))",
  },
  berlin: {
    name: "Berlin",
    polygon: "POLYGON((13.20 52.40, 13.60 52.40, 13.60 52.65, 13.20 52.65, 13.20 52.40))",
  },
  sanfrancisco: {
    name: "San Francisco",
    polygon: "POLYGON((-122.52 37.70, -122.35 37.70, -122.35 37.83, -122.52 37.83, -122.52 37.70))",
  },
  sf: {
    name: "San Francisco",
    polygon: "POLYGON((-122.52 37.70, -122.35 37.70, -122.35 37.83, -122.52 37.83, -122.52 37.70))",
  },
  losangeles: {
    name: "Los Angeles",
    polygon: "POLYGON((-118.66 33.70, -118.15 33.70, -118.15 34.33, -118.66 34.33, -118.66 33.70))",
  },
  la: {
    name: "Los Angeles",
    polygon: "POLYGON((-118.66 33.70, -118.15 33.70, -118.15 34.33, -118.66 34.33, -118.66 33.70))",
  },
  rome: {
    name: "Rome",
    polygon: "POLYGON((12.35 41.78, 12.65 41.78, 12.65 42.02, 12.35 42.02, 12.35 41.78))",
  },
  seoul: {
    name: "Seoul",
    polygon: "POLYGON((126.75 37.40, 127.20 37.40, 127.20 37.70, 126.75 37.70, 126.75 37.40))",
  },
  amsterdam: {
    name: "Amsterdam",
    polygon: "POLYGON((4.75 52.30, 5.05 52.30, 5.05 52.45, 4.75 52.45, 4.75 52.30))",
  },
};

// Domain to Qloo entity type URN mapping
const DOMAIN_TO_QLOO_TYPE: Record<string, string> = {
  anime: "urn:entity:movie",
  movies: "urn:entity:movie",
  cinema: "urn:entity:movie",
  music: "urn:entity:artist",
  books: "urn:entity:book",
  places: "urn:entity:place",
};

// Domain badge labels following design system
const DOMAIN_BADGE_LABELS: Record<Domain, string> = {
  anime: ":: ANIME",
  movies: ":: CINEMA",
  music: ":: VINYL",
  books: ":: BOOKS",
  places: ":: PLACES",
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Canonical seed titles for human-readable bridge generation
const CANONICAL_SEED_TITLES: Record<string, string> = {
  "9B33A620-68CA-49B3-BFCF-F09CCF8AD595": "Spirited Away",
  "6EBC0C74-90B9-4E45-941B-1BBAA521DA16": "Cowboy Bebop",
  "C55D99C5-7A50-42FF-85E8-AB6C7FB937E7": "Frieren: Beyond Journey's End",
  "3A02361C-987B-4F7E-9AAD-071C3853AD92": "Blade Runner 2049",
  "81AD2DF6-5C6E-4093-BF8A-A12EE901D6BE": "Drive",
  "BAF6317A-DF94-4C90-92AE-63F86560C21B": "Texas Sun (Khruangbin)",
  "9446057A-BC4E-468A-BBC7-A3D8F9B70C83": "Texas Sun (Khruangbin & Leon Bridges)",
  "7B4EDC5A-9779-4338-88DA-D5C415385511": "Loveless (My Bloody Valentine)",
};

// Known album-to-artist seed redirects to satisfy Qloo affinity graph
const ALBUM_TO_ARTIST_MAP: Record<string, string> = {
  "D0E431FD-B38C-4A08-B862-5CF083FC20A6": "BAF6317A-DF94-4C90-92AE-63F86560C21B", // Texas Sun Album -> Khruangbin
  "336E9710-0131-42AB-B7CC-E6EBFA7DCBB6": "7B4EDC5A-9779-4338-88DA-D5C415385511", // Loveless Album -> My Bloody Valentine
};

function resolveSeedTitle(seedIdOrTitle: string): string {
  if (CANONICAL_SEED_TITLES[seedIdOrTitle]) {
    return CANONICAL_SEED_TITLES[seedIdOrTitle];
  }
  if (CANONICAL_SEED_MAP[seedIdOrTitle]) {
    return seedIdOrTitle;
  }
  if (seedIdOrTitle && !seedIdOrTitle.includes("-")) {
    return seedIdOrTitle;
  }
  return "your active vault";
}

async function resolveSeed(seed: string, domain: string, apiKey: string): Promise<string | null> {
  // Check canonical seed map first
  if (CANONICAL_SEED_MAP[seed]) {
    return CANONICAL_SEED_MAP[seed];
  }
  // If seed title matches canonical titles
  const foundByTitle = Object.entries(CANONICAL_SEED_TITLES).find(
    ([, title]) => title.toLowerCase() === seed.toLowerCase()
  );
  if (foundByTitle) return foundByTitle[0];

  try {
    const expectedType = DOMAIN_TO_QLOO_TYPE[domain] || "";
    let url = `${QLOO_BASE_URL}/search?query=${encodeURIComponent(seed)}&take=1`;
    if (expectedType) {
      url += `&types=${encodeURIComponent(expectedType)}`;
    }
    const res = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
        "User-Agent": "TasteMem/1.0",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.entity_id || null;
  } catch {
    return null;
  }
}

function calculateAffinityScore(rawAffinity: unknown, fallbackRank: number): number {
  let num: number | null = null;
  if (typeof rawAffinity === "number" && !isNaN(rawAffinity)) {
    num = rawAffinity;
  } else if (typeof rawAffinity === "string") {
    const parsed = parseFloat(rawAffinity);
    if (!isNaN(parsed)) num = parsed;
  }

  if (num !== null) {
    if (num < 0) return 0;
    if (num <= 1) return Math.min(100, Math.max(0, Math.round(num * 100)));
    if (num <= 100) return Math.min(100, Math.max(0, Math.round(num)));
    return 100;
  }

  return Math.max(65, Math.min(95, 94 - fallbackRank * 3));
}

function generateBridgeReasoning(
  mode: RecommendationMode,
  affinityPercent: number,
  popularity: number,
  domain: Domain,
  seedTitle: string,
  entity: any,
  cityName?: string
): string {
  const p = entity.properties || {};
  const tagsList = Array.isArray(entity.tags) ? entity.tags : [];
  const tagNames = tagsList.slice(0, 3).map((t: any) => t?.name).filter(Boolean);
  const tagsStr = tagNames.join(", ");

  switch (mode) {
    case "more_like_this":
      if (p.emotional_tone_description) {
        const toneClause = p.emotional_tone_description.split(",")[0].toLowerCase().trim();
        return `Shares ${toneClause} sensibilities and high cultural resonance (${affinityPercent}%) with ${seedTitle}.`;
      }
      if (tagsStr) {
        return `Direct aesthetic continuity with ${seedTitle}, sharing mutual ${tagsStr} world-building (${affinityPercent}% affinity).`;
      }
      return `High cultural affinity (${affinityPercent}%) rooted in the signature mood, aesthetic weight, and emotional depth of ${seedTitle}.`;

    case "surprise_me": {
      const popPct = Math.round(popularity * 100);
      const rarityLabel = popPct <= 25 ? "Deep underground discovery" : popPct <= 50 ? "Curated indie gem" : "Niche discovery";
      if (tagsStr) {
        return `${rarityLabel} (${popPct}% mainstream index): channels the ${tagsStr} spirit of ${seedTitle} through an uncompromised indie lens.`;
      }
      return `${rarityLabel} (${affinityPercent}% affinity, ${popPct}% mainstream index): mirrors the creative DNA and nuanced depth of ${seedTitle} beneath the mainstream radar.`;
    }

    case "go_wild": {
      const domainMediums: Record<string, string> = {
        books: "literary narrative and evocative prose",
        music: "immersive sonic soundscapes and textured rhythm",
        places: "a tangible physical sanctuary",
        movies: "visionary cinematic storytelling",
        anime: "expressive hand-crafted animation",
      };
      const mediumDesc = domainMediums[domain] || "an alternative creative medium";
      if (tagsStr) {
        return `Cross-domain leap (${affinityPercent}% affinity): translates the ${tagsStr} atmosphere of ${seedTitle} into ${mediumDesc}.`;
      }
      return `Cross-domain leap (${affinityPercent}% affinity): translates the core aesthetic frequency and cultural weight of ${seedTitle} into ${mediumDesc}.`;
    }

    case "trip_guide": {
      const loc = cityName || "City";
      const neighborhood = p.neighborhood || (p.address && p.address.includes(",") ? p.address.split(",")[1].trim() : null);
      const locLabel = neighborhood ? `${loc} Cultural Haven in ${neighborhood}` : `${loc} Cultural Haven`;
      if (p.ambience_description) {
        const match = p.ambience_description.match(/immersive [^,.]+|distinctive [^,.]+|intimate [^,.]+|gothic [^,.]+|minimalist [^,.]+/i);
        const ambHook = match ? match[0].toLowerCase() : "an evocative atmosphere";
        return `${locLabel}: features ${ambHook} resonating with the mood of ${seedTitle} (${affinityPercent}% affinity).`;
      }
      return `Curated ${locLabel} (${affinityPercent}% affinity): grounds the evocative aesthetic of ${seedTitle} into physical urban space.`;
    }
  }
}

async function resolveCoverImage(entity: any, domain: Domain, title: string): Promise<string> {
  const props = entity.properties || {};
  const isPublicUrl = (url: unknown): url is string =>
    typeof url === "string" && url.startsWith("http") && !url.includes("images.qloo.com");

  if (isPublicUrl(props.image?.url)) {
    return props.image.url;
  }
  if (Array.isArray(props.images) && isPublicUrl(props.images[0]?.url)) {
    return props.images[0].url;
  }
  if (Array.isArray(props.photos) && isPublicUrl(props.photos[0]?.url)) {
    return props.photos[0].url;
  }

  try {
    return await fetchArtworkFallback(title, domain);
  } catch {
    return DOMAIN_FALLBACK_IMAGES[domain] || DOMAIN_FALLBACK_IMAGES.movies;
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.QLOO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "QLOO_API_KEY environment variable is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") || "more_like_this") as RecommendationMode;
  const rawSeeds = searchParams.get("seeds") || "";
  const domain = (searchParams.get("domain") || "movies").toLowerCase() as Domain;
  const targetDomainRaw = searchParams.get("targetDomain")?.toLowerCase() as Domain | undefined;
  const rawCity = searchParams.get("city") || "Tokyo";

  // 1. Validate Mode
  const validModes: RecommendationMode[] = ["more_like_this", "surprise_me", "go_wild", "trip_guide"];
  if (!validModes.includes(mode)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid mode '${mode}'. Must be one of: ${validModes.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // 2. Validate Seeds
  const seedTokens = rawSeeds.split(",").map((s) => s.trim()).filter(Boolean);
  if (seedTokens.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required 'seeds' parameter. Provide at least one entity UUID or title.",
      },
      { status: 400 }
    );
  }

  // 3. Resolve Seed UUIDs & map albums to artists if needed
  const validUuids: string[] = [];
  let primarySeedTitle: string = resolveSeedTitle(seedTokens[0]);

  for (const token of seedTokens) {
    if (UUID_REGEX.test(token)) {
      // Check album to artist redirection for music domain
      const effectiveUuid = ALBUM_TO_ARTIST_MAP[token] || token;
      validUuids.push(effectiveUuid);
    } else {
      const resolved = await resolveSeed(token, domain, apiKey);
      if (resolved) {
        const effectiveUuid = ALBUM_TO_ARTIST_MAP[resolved] || resolved;
        validUuids.push(effectiveUuid);
        if (!primarySeedTitle || primarySeedTitle === "your active vault") {
          primarySeedTitle = token;
        }
      }
    }
  }

  if (validUuids.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Could not resolve provided seeds to valid Qloo entity IDs. Ensure valid UUIDs are supplied.",
      },
      { status: 400 }
    );
  }

  // 4. Determine Effective Domain & Qloo filter.type
  let effectiveDomain: Domain = domain;
  let qlooFilterType = DOMAIN_TO_QLOO_TYPE[domain] || "urn:entity:movie";
  let wktPolygon: string | null = null;
  let resolvedCityName: string | null = null;

  if (mode === "go_wild") {
    // Cross-domain leap: targetDomain takes precedence
    if (targetDomainRaw && DOMAIN_TO_QLOO_TYPE[targetDomainRaw]) {
      effectiveDomain = targetDomainRaw;
    } else {
      // Smart default cross-domain selection
      if (domain === "movies" || domain === "anime") {
        effectiveDomain = "books";
      } else if (domain === "books") {
        effectiveDomain = "music";
      } else if (domain === "music") {
        effectiveDomain = "movies";
      } else {
        effectiveDomain = "music";
      }
    }
    qlooFilterType = DOMAIN_TO_QLOO_TYPE[effectiveDomain] || "urn:entity:book";
  } else if (mode === "trip_guide") {
    effectiveDomain = "places";
    qlooFilterType = "urn:entity:place";

    const normalizedCity = rawCity.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cityEntry = CITY_POLYGONS[normalizedCity] || CITY_POLYGONS.tokyo;
    wktPolygon = cityEntry.polygon;
    resolvedCityName = cityEntry.name;
  }

  // 5. Build Qloo /v2/insights request parameters
  const queryParams = new URLSearchParams({
    "signal.interests.entities": validUuids.slice(0, 5).join(","),
    "filter.type": qlooFilterType,
    sort_by: "affinity",
    take: mode === "surprise_me" ? "15" : "10",
  });

  if (mode === "surprise_me") {
    queryParams.set("filter.popularity.max", "0.60");
  }

  if (mode === "trip_guide" && wktPolygon) {
    queryParams.set("filter.location", wktPolygon);
  }

  const qlooUrl = `${QLOO_BASE_URL}/v2/insights?${queryParams.toString()}`;

  try {
    let qlooRes = await fetch(qlooUrl, {
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
        "User-Agent": "TasteMem/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });

    // If Mode 2 returned empty or 400 with 0.60, retry with relaxed 0.75 for resilience
    if (!qlooRes.ok && mode === "surprise_me") {
      queryParams.set("filter.popularity.max", "0.75");
      qlooRes = await fetch(`${QLOO_BASE_URL}/v2/insights?${queryParams.toString()}`, {
        headers: {
          "X-Api-Key": apiKey,
          Accept: "application/json",
          "User-Agent": "TasteMem/1.0",
        },
        signal: AbortSignal.timeout(8000),
      });
    }

    if (!qlooRes.ok) {
      const errText = await qlooRes.text();
      console.error(`Qloo API Error [${qlooRes.status}]:`, errText);
      return NextResponse.json(
        {
          success: false,
          error: `Upstream Qloo API responded with status ${qlooRes.status}`,
          details: errText,
        },
        { status: qlooRes.status === 400 ? 400 : qlooRes.status === 429 ? 429 : 502 }
      );
    }

    const qlooData = await qlooRes.json();
    const rawEntities = qlooData?.results?.entities || [];

    const recommendations: RecommendationItem[] = [];

    for (let i = 0; i < rawEntities.length; i++) {
      const entity = rawEntities[i];
      const popularity = typeof entity.popularity === "number" ? entity.popularity : 0.45;

      // Mode 2 strict filtering: verify popularity <= 0.60
      if (mode === "surprise_me" && popularity > 0.60) {
        continue;
      }

      const affinity = calculateAffinityScore(entity.query?.affinity, i);
      const title = entity.name || "Untitled";
      const props = entity.properties || {};

      // Defensive tags array guard (handles Qloo null tags bug)
      const tagsList = Array.isArray(entity.tags) ? entity.tags : [];
      const tagNames = tagsList.slice(0, 3).map((t: any) => t?.name).filter(Boolean);

      // Artwork extraction pipeline
      const coverImageUrl = await resolveCoverImage(entity, effectiveDomain, title);

      // Year extraction
      const year = props.release_year
        ? String(props.release_year)
        : props.publication_year
        ? String(props.publication_year)
        : props.start_year
        ? String(props.start_year)
        : undefined;

      // Subtitle
      const subtitle =
        effectiveDomain === "music"
          ? (props.primary_genres?.[0] || "Artist")
          : effectiveDomain === "places"
          ? (props.neighborhood || resolvedCityName || "Sanctuary")
          : effectiveDomain === "books"
          ? (props.publisher || "Literature")
          : year;

      const address = props.address || undefined;
      const description =
        props.short_description ||
        props.description?.slice(0, 240) ||
        props.genre_description?.slice(0, 240) ||
        props.overall_description?.slice(0, 240) ||
        undefined;

      const badgeLabel = DOMAIN_BADGE_LABELS[effectiveDomain] || ":: DISCOVERY";

      const bridgeReasoning = generateBridgeReasoning(
        mode,
        affinity,
        popularity,
        effectiveDomain,
        primarySeedTitle,
        entity,
        resolvedCityName || undefined
      );

      recommendations.push({
        id: entity.entity_id || `qloo-rec-${i}`,
        title,
        subtitle,
        domain: effectiveDomain,
        badgeLabel,
        affinity,
        popularity: Number(popularity.toFixed(2)),
        coverImageUrl,
        bridgeReasoning,
        year,
        description,
        address,
        tags: tagNames.length > 0 ? tagNames : undefined,
      });

      // Cap at 10 items
      if (recommendations.length >= 10) break;
    }

    const responsePayload: RecommendationsApiResponse = {
      success: true,
      mode,
      count: recommendations.length,
      totalResults: recommendations.length,
      seedUsed: primarySeedTitle,
      targetDomain: mode === "go_wild" ? effectiveDomain : undefined,
      city: mode === "trip_guide" ? resolvedCityName || undefined : undefined,
      recommendations,
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    if (err.name === "TimeoutError" || err.code === "UND_ERR_CONNECT_TIMEOUT") {
      return NextResponse.json(
        { success: false, error: "Upstream Qloo API request timed out" },
        { status: 504 }
      );
    }
    console.error("Recommendations route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error processing recommendations",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
