import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Domain } from "@/types";

export const dynamic = "force-dynamic";

interface VibeRequestPayload {
  note: string;
  existingShelves?: Array<{ id: string; title: string; domain: Domain }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: VibeRequestPayload = await request.json();
    const note = body.note?.trim();

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note text is required for vibe analysis" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured on the server",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const existingShelvesContext = (body.existingShelves || [])
      .map((s) => `- "${s.title}" (${s.domain})`)
      .join("\n");

    const prompt = `
You are the TasteMem Cultural Intelligence and Vibe Routing Engine.
Analyze the user's personal life note, memory, feeling, or input to understand its aesthetic frequency, mood, and cultural undertones.

USER INPUT:
"${note}"

CURRENT EXISTING SHELVES:
${existingShelvesContext || "None"}

YOUR TASK:
1. Determine if this input belongs in one of the user's existing shelves, or if a new evocative vibe shelf should be created (e.g. "Morning Fun", "Midnight Delight", "Deep Focus", "Adrenaline & Grit", "Cozy Hearth", "Wanderlust").
2. Determine the most representative cultural domain for this feeling: "anime" | "movies" | "music" | "books" | "places".
3. Extract 3-5 atmospheric tags (lowercase, concise, e.g. ["misty", "dawn", "lo-fi", "outdoor"]).
4. Write a 1-sentence evocative vibe summary explaining the feeling.
5. Propose 2-3 canonical cultural entity search seeds (real-world films, music artists/albums, books, or cultural havens) that match this vibe for querying the Qloo cultural graph.
6. Pick an aesthetic hex color accent (sleek, high contrast, non-garish) that represents this shelf.

Respond with strict JSON following this exact schema:
{
  "shelfTitle": string,
  "shelfDomain": "anime" | "movies" | "music" | "books" | "places",
  "tags": string[],
  "vibeSummary": string,
  "isNewShelfRecommended": boolean,
  "suggestedEntitySeeds": [
    {
      "title": string,
      "domain": "anime" | "movies" | "music" | "books" | "places",
      "reason": string
    }
  ],
  "colorTheme": string
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseText = response.text?.trim() || "{}";
    const parsedData = JSON.parse(responseText);

    const validDomains: Domain[] = ["anime", "movies", "music", "books", "places"];
    const domain: Domain = validDomains.includes(parsedData.shelfDomain)
      ? parsedData.shelfDomain
      : "music";

    return NextResponse.json({
      success: true,
      shelfTitle: parsedData.shelfTitle || "Personal Vault",
      shelfDomain: domain,
      tags: Array.isArray(parsedData.tags) ? parsedData.tags : [],
      vibeSummary: parsedData.vibeSummary || "Evocative life memory",
      isNewShelfRecommended: Boolean(parsedData.isNewShelfRecommended),
      suggestedEntitySeeds: Array.isArray(parsedData.suggestedEntitySeeds)
        ? parsedData.suggestedEntitySeeds
        : [],
      colorTheme: parsedData.colorTheme || "#000000",
    });
  } catch (error: any) {
    console.error("TasteMem Vibe API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process vibe analysis",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
