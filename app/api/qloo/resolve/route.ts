import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const domain = searchParams.get("domain") || "";

  if (!query) {
    return NextResponse.json({ entity_id: null });
  }

  const apiKey = process.env.QLOO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ entity_id: null, warning: "QLOO_API_KEY not configured" });
  }

  // Map domain to Qloo entity types
  const typeMap: Record<string, string> = {
    anime: "urn:entity:tv_show",
    movies: "urn:entity:movie",
    music: "urn:entity:artist",
    books: "urn:entity:book",
    places: "urn:entity:place",
  };

  const expectedType = typeMap[domain] || "";
  let url = `https://hackathon.api.qloo.com/search?query=${encodeURIComponent(query)}&take=1`;
  if (expectedType) {
    url += `&types=${encodeURIComponent(expectedType)}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ entity_id: null });
    }

    const data = await res.json();
    const results = data.results || [];
    if (results.length > 0) {
      return NextResponse.json({
        entity_id: results[0].entity_id,
        name: results[0].name,
        types: results[0].types,
      });
    }

    return NextResponse.json({ entity_id: null });
  } catch (err: any) {
    console.error("Qloo resolve error:", err);
    return NextResponse.json({ entity_id: null });
  }
}
