# 🧠 TasteMem — Vision & Final Outcome Specification

> **"You experience something you love — a film, an album, a café, or just a morning run. You speak or type it in. The AI understands the vibe, files it into your custom life shelves, and unlocks grounded cultural discoveries you never saw coming."**

---

## 1. What TasteMem Actually Is

TasteMem is **not** a rigid category filing cabinet (it doesn't pigeonhole your life into generic folders like "Anime" or "Books").

Instead, TasteMem organizes your life into **custom vibe shelves** reflecting your real-world lifestyle and moods:
- 🌅 **"Morning Fun"** *(morning runs, espresso recipes, ambient playlists, breakfast diners)*
- 🌙 **"Midnight Delight"** *(late-night neon anime, synthwave records, ramen joints, noir fiction)*
- 🧘 **"Deep Focus"** *(minimalist essays, lo-fi beats, quiet study cafés)*
- ⚡ **"Adrenaline & Grit"** *(intense cinema, workout tracks, high-energy gaming)*

You can drop in **anything**:
1. **Specific Cultural Media:** A film (*"Spirited Away"*), an album (*"In Rainbows"*), a book (*"Norwegian Wood"*), or a café (*"Omotesando Koffee"*).
2. **Personal Life Notes & Experiences:** A raw feeling or daily memory (*"went to run this morning in the park. loved the misty air, felt super alive"*).

TasteMem understands the mood, aesthetic, and cultural undertones of your input, auto-places it onto the appropriate vibe shelf, and uses it to fuel serendipitous cultural recommendations.

---

## 2. The Core User Flows & Screen Mechanics

### 2.1 The Canvas (Home Screen)
- **Visual Aesthetic:** Clean, stark white background (`#FFFFFF`) with smooth, dark squircle tiles (`#000000` / `#121212`) floating freely.
- **Physical Dynamics:** Tiles have authentic, tactile liquid spring physics (squish, stretch, and organic micro-jiggle on touch).
- **First Launch Experience:**
  - Zero mandatory login screens. The user lands directly on a stark, inviting canvas.
  - An initial welcoming pill: *"Tap + to log your first memory or feeling"*. Shelves materialize dynamically as the user starts logging.
- **Persistent Controls:** Two minimal floating action pills at the bottom:
  - **`+ ADD`** (Log a thought, experience, or piece of media)
  - **`◎ COMPASS`** (Explore cultural recommendations)

---

### 2.2 The Universal Ingestion Flow ("Drop In Anything")
- **The Trigger:** Tapping **`+ ADD`** opens an effortless, full-focus bottom sheet.
- **Input Methods:**
  - **Type freely:** User begins typing whatever they want.
  - **One-Tap Floating Mic:** Tap the minimal mic pill to speak aloud; on-device speech-to-text transcribes their thought instantly into the field.
- **Intelligent Classification & Real-Time Feedback:**
  - **If the user enters a cultural title (film, song, place, anime, book):**
    - Live search results show official high-resolution cover art immediately.
    - Selecting it attaches the verified cover and canonical **Qloo entity UUID**.
    - User can add a quick 1-line note or star rating.
  - **If the user enters a personal life experience note ("went for a run this morning..."):**
    - The AI analyzes the note, extracts the vibe/mood signals (e.g. *energized, morning, outdoor, mindful*), and flags it for shelf routing.
    - If the user types a niche/unmatched entity, it saves as a **Custom Memory** with a sleek typographic monogram.
- **Auto-Placement into Vibe Shelves:**
  - The AI compares the new memory against existing shelves (e.g., routing the morning run into *"Morning Fun"*).
  - If no suitable shelf exists, TasteMem creates a brand-new custom vibe shelf automatically.
  - A subtle pill shows the destination shelf with a one-tap option to redirect if desired.
- **The Save Moment:**
  - Tapping **Save** triggers an elastic physical animation flying the card into its shelf.

---

### 2.3 The Shelf View (Life Vibe Gallery)
- Opening a shelf (e.g., *"Morning Fun"* or *"Midnight Delight"*) reveals a unified, aesthetic collection:
  - **Media Items:** Beautiful visual cover posters.
  - **Personal Life Notes:** Minimalist, high-contrast **typographic post-it cards** displaying the raw text, timestamp, and subtle mood tags.
- Tapping any card opens a clean tactile bottom sheet with full details, notes, and one-tap options to edit or remove.

---

### 2.4 The Taste Compass (Cultural AI Engine)
- **The Trigger:** Tapping **`◎ COMPASS`** from the main canvas or within any specific shelf.
- **How it Works with Personal Life Notes:**
  - The AI synthesizes cultural signals from your life notes (e.g., *morning runs + outdoor energy + pour-over coffee notes*) into structured cultural search seeds.
  - Traverses **Qloo's 575M+ entity cultural graph** (`/v2/insights`) to recommend real, verifiable media and spots.
- **The 4 Exploration Modes:**
  1. **"More Like This"** — Direct high-affinity matches for your current vibe.
  2. **"Surprise Me"** — High taste correlation with lower mainstream popularity (indie gems, obscure records, boutique roasters).
  3. **"Go Wild" (Cross-Domain Magic)** — Bridges completely different domains (e.g., your morning run vibe + indie anime taste ➔ recommends specific ambient techno vinyls or Japanese running apparel).
  4. **"Trip Guide"** — Applies your shelf's vibe to any destination city (*"What would I love in Tokyo for a Morning Fun vibe?"*).
- **Closing the Loop:**
  - Every recommendation card displays artwork, title, match percentage, and plain-English reasoning (*"94% Match — Recommended based on your morning outdoor runs and ambient music"*).
  - A single tap on **`+ Pin to Shelf`** instantly saves the discovery into the user's shelf.

---

## 3. Platform & Technical Foundations

- **Platforms:** Single **Capacitor** codebase running natively on both **Android** and **iPhone (iOS)** with responsive web capability.
- **Visual Design:** Stark white canvas (`#FFFFFF`) with dark squircle tiles (`#000000`), Nothing OS / Teenage Engineering inspired monochrome minimalism, and Framer Motion spring physics.
- **Data & Sync:**
  - Guest/Anonymous first for immediate frictionless usage.
  - Optional Firebase Auth & Firestore sync so memories seamlessly update across both the user's Android phone and iPhone.
- **Backend & Gateway:** Hosted API gateway proxying Qloo API keys, AniList/TMDB/Deezer/Google Books metadata, and Gemini context analysis securely.

---

## 4. Definition of Done ("Exactly Where to Build & When to Stop")

Building is complete when:
1. **The Canvas:** Opens as a stark white canvas with tactile squircle vibe shelves on both Android and iPhone.
2. **The Ingestion Engine:** Accepts both media titles and voice/typed life notes, finds artwork/creates typographic post-its, and auto-routes them into custom vibe shelves (*Morning Fun*, *Midnight Delight*, etc.).
3. **The Gallery:** Displays media posters alongside high-contrast typographic note cards.
4. **The Taste Compass:** Synthesizes shelf vibes and life notes into live Qloo queries across the 4 modes and allows 1-tap pinning to a shelf.
5. **Cross-Device Sync:** Data syncs between Android and iOS.
6. **Zero Bloat:** No social feeds, no public profiles, no mandatory onboarding questionnaires, no ads.
