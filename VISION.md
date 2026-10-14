# 🧠 TasteMem — Your Personal Cultural Shelf

> **Every experience you've loved, organized visually. Cross-domain recommendations, powered by Qloo's Cultural AI.**

---

## 1. Product Vision & Executive Summary

Modern consumers explore culture across disconnected silos:
- Anime tracked on **MyAnimeList**
- Movies logged on **Letterboxd**
- Books rated on **Goodreads**
- Music tracked on **Spotify**
- Cafés and restaurants saved in **Google Maps** or **Instagram bookmarks**

None of these platforms talk to each other. None of them understand a user's taste as a unified, multifaceted identity. When someone asks:
- *"What should I watch tonight?"*
- *"Where should I eat in Tokyo?"*
- *"Recommend me something wild based on what I like"*

...traditional recommendation engines offer generic trending lists or hallucinate responses without cultural grounding.

**TasteMem** solves this by turning personal cultural logging into an effortless, visual experience. Users store things they have enjoyed or experienced—anime watched, movies seen, places visited, books read, music discovered—in clean, visual "Shelves" with cover art, titles, and personal one-liners. 

Behind the scenes, every logged item is mapped to **Qloo's 575M+ entity cultural graph**. When the user asks for recommendations, an AI intelligence layer translates their intent into structured queries, using their accumulated taste graph to deliver empirically grounded, cross-domain recommendations.

---

## 2. Target User Experience & User Stories

### Target User: The Culturally Curious Explorer
Someone who enjoys diverse cultural pursuits (e.g., watches anime, loves artisan dining, listens to indie music, reads speculative fiction) and wants:
1. A single tactile, visual home for their cultural memories.
2. Immediate gratification: seeing beautiful poster cards and personal notes rather than plain text notes.
3. Recommendations that respect their actual taste and surprise them across categories.

### Primary User Stories
1. **Visual Shelf Logging:** As a user, I can quickly search or type an anime or movie (e.g., *"Spirited Away"*), instantly view its high-res cover art and description, add my short note (*"comfort watch on rainy nights"*), and pin it to my visual shelf.
2. **Effortless Multi-Category Memory:** As a user, I can switch between shelves—*Anime Watched*, *Films & Shows*, *Places & Cafés Visited*, *Music in Rotation*, *Books Read*—all formatted as clean, visual cards.
3. **Cross-Domain "Go Wild" Recommendations:** As a user, I can ask for recommendations outside my usual categories (e.g., *"Recommend me something wild based on my anime and food shelves"*), prompting the app to traverse Qloo's taste graph and recommend correlated literature, brands, or travel destinations.
4. **Taste Profile Fingerprint:** As a user, I can view an auto-generated visual summary of my cultural affinities without filling out tedious onboarding questionnaires.

---

## 3. Core-First Product Architecture

To maintain zero clutter and high execution velocity, the product focuses on two essential loops:

```
┌─────────────────────────────────────────────────────────┐
│                    1. INGESTION LOOP                    │
│ User adds title ➔ Free Metadata API fetches poster      │
│ ➔ Qloo /search resolves canonical UUID ➔ Added to Shelf  │
└──────────────────────────┬──────────────────────────────┘
                           │ Accumulates Taste Graph
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  2. RECOMMENDATION LOOP                 │
│ User picks Mode ("Safe", "Surprise", "Go Wild")         │
│ ➔ Qloo /v2/insights traverses cross-domain affinities   │
│ ➔ Real entity cards returned with affinity percentage   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. The 4 Recommendation Modes

1. **"More Like This" (Direct Match):**
   - Direct high-affinity recommendations within the same domain (e.g., user loves *Attack on Titan* ➔ recommends *Vinland Saga*).
2. **"Surprise Me" (Adjacent Indie Discovery):**
   - Discovers hidden gems by filtering for lower entity popularity (`filter.popularity.max: 0.60`) with moderate-to-high taste correlation.
3. **"Go Wild" (Cross-Domain Leap):**
   - Bridges disparate interests (e.g., combines *Studio Ghibli* + *Artisan Ramen* tastes to recommend *Japanese Ceramic Studios* or *Specialty Tea Houses* via Qloo cross-category affinity).
4. **"Trip & City Guide" (Location Grounding):**
   - Applies the user's universal taste fingerprint to a specific destination coordinate or city name (`filter.location`).

---

## 5. Anti-Clutter & Anti-Bloat Manifesto

In accordance with core-first design principles, TasteMem will explicitly **NOT** include:
- ❌ Social feeds, followers, comments, or likes (this is an intimate personal memory vault).
- ❌ Complex rich-text formatting, Markdown editors, or nested folders.
- ❌ Tedious onboarding quizzes (taste forms naturally as items are logged).
- ❌ Account creation walls or third-party auth setups during MVP phase.
- ❌ Ad networks or sponsored affiliate popups.

---

## 6. Success Metrics for Hackathon Demo

1. **Cold-Start to Wow:** An empty app reaches a populated, gorgeous multi-shelf visual state in under 60 seconds.
2. **Cross-Domain Affinity Proof:** Demonstrating that logging 3 anime titles and 2 cafés successfully influences book or music recommendations with verifiable Qloo affinity scores.
3. **Zero Hallucination:** 100% of recommended items correspond to verified cultural entities in Qloo's 575M+ database.

---

## 7. Deliverables & Hackathon Blueprint

For the comprehensive end-to-end specifications, user journeys, video demo scripts, and hackathon submission requirements, refer to the master [DELIVERABLES.md](DELIVERABLES.md).
