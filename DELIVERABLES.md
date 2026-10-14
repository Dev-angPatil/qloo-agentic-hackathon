# 📦 TasteMem — Complete Finished Product Documentation & Deliverables Guide

> **Project:** TasteMem — Your Personal Cultural Shelf  
> **Hackathon:** Qloo Agentic Hackathon (Devpost)  
> **Core Value:** Every experience you've loved, organized visually. Cross-domain recommendations, powered by Qloo's Cultural AI.  
> **Repository:** `/home/deu/Coding Repos/qloo-agentic-hackathon`  
> **Status:** Release Candidate (RC-1) Delivery Specification  

---

## 📑 Table of Contents

1. [Executive Summary & Product Identity](#1-executive-summary--product-identity)
2. [Target Persona & Problem Framing](#2-target-persona--problem-framing)
3. [The Complete Deliverable Package](#3-the-complete-deliverable-package)
4. [Feature-by-Feature Finished Product Specification](#4-feature-by-feature-finished-product-specification)
   - [4.1 Spatial Liquid Canvas (Nothing OS Aesthetic)](#41-spatial-liquid-canvas-nothing-os-aesthetic)
   - [4.2 Domain-Aware Multi-Shelves](#42-domain-aware-multi-shelves)
   - [4.3 Universal Smart Add & Zero-Friction Ingestion Pipeline](#43-universal-smart-add--zero-friction-ingestion-pipeline)
   - [4.4 The Taste Compass — 4 Recommendation Modes](#44-the-taste-compass--4-recommendation-modes)
   - [4.5 Cultural Affinity Badges & Reasoning Explainability](#45-cultural-affinity-badges--reasoning-explainability)
   - [4.6 Local-First Data Vault & Instant Portability](#46-local-first-data-vault--instant-portability)
5. [Anti-Bloat & Anti-Clutter Manifesto (Out-of-Scope Guardrails)](#5-anti-bloat--anti-clutter-manifesto-out-of-scope-guardrails)
6. [System Architecture & External Integrations](#6-system-architecture--external-integrations)
   - [6.1 Full Data Flow Diagram](#61-full-data-flow-diagram)
   - [6.2 Qloo Cultural AI Gateway Specification](#62-qloo-cultural-ai-gateway-specification)
   - [6.3 Multi-Domain Free Metadata Pipeline](#63-multi-domain-free-metadata-pipeline)
7. [End-to-End User Journeys](#7-end-to-end-user-journeys)
8. [Hackathon Submission & Presentation Package](#8-hackathon-submission--presentation-package)
   - [8.1 Devpost Submission Pitch](#81-devpost-submission-pitch)
   - [8.2 3-Minute Video Demo Narrative Script](#82-3-minute-video-demo-narrative-script)
   - [8.3 The 30-Second Judge "Aha!" Moment Protocol](#83-the-30-second-judge-aha-moment-protocol)
9. [Verification & Acceptance Criteria](#9-verification--acceptance-criteria)
10. [Directory Structure of Deliverables](#10-directory-structure-of-deliverables)

---

## 1. Executive Summary & Product Identity

### 1.1 The One-Liner
**TasteMem** is a tactile, minimalist personal cultural shelf that organizes everything you have loved across anime, cinema, music, books, and places—transforming your accumulated taste memories into mathematically grounded, cross-domain recommendations via **Qloo’s 575M+ entity Cultural AI graph**.

### 1.2 Core Philosophy
1. **Core-First & Anti-Clutter:** No bloated social feeds, no follow buttons, no algorithmic spam. Only high-contrast visual tiles, your personal memories, and direct intelligence.
2. **Tactile Liquid Monochrome:** Inspired by **Nothing OS** and **Teenage Engineering**, every element has physical mass, fluid bounce, and gelatinous jiggle on interaction.
3. **Cross-Domain Discovery ("Go Wild"):** Moving beyond single-domain silos (e.g. Spotify only knows music; Letterboxd only knows movies). If you love *Studio Ghibli* and *Artisan Pour-Over Cafés*, TasteMem empirically correlates your profile to recommend *Japanese speculative fiction* or *post-rock vinyls*.

---

## 2. Target Persona & Problem Framing

### 2.1 The Problem: Cultural Fragmentation & LLM Hallucinations
Modern culture enthusiasts track their experiences in isolated silos:
- **Anime** tracked on MyAnimeList or AniList
- **Cinema & TV** logged on Letterboxd
- **Music** favorited on Spotify / Apple Music
- **Literature** cataloged on Goodreads
- **Cafés & Travel** saved in Google Maps or Instagram saves

**Why Current Solutions Fail:**
- **Zero Interoperability:** None of these apps communicate with each other. No service recognizes that your cinema taste directly informs your dining preferences.
- **LLM Hallucinations:** When prompted *"Recommend something surprising based on what I like"*, general-purpose LLMs hallucinate non-existent titles or return generic mainstream blockbusters.
- **Onboarding Fatigue:** Existing recommendation engines demand 50-question onboarding surveys before delivering value.

### 2.2 Target Persona: The Culturally Curious Explorer
- Appreciates curated, tactile aesthetics (analog cameras, vinyl records, brutalist design).
- Enjoys diverse cultural verticals (e.g. watches anime, reads Murakami, frequents indie coffee roasters, listens to shoegaze).
- Wants an instant, zero-friction memory keeper with zero social judgment.

---

## 3. The Complete Deliverable Package

The finished product delivery consists of four production-grade deliverables:

| Deliverable | Format | Destination | Key Purpose |
| :--- | :--- | :--- | :--- |
| **D1: Interactive Web App** | Next.js 15 + React 19 + Framer Motion | `app/`, `components/`, `src/` | Fluid OLED canvas, draggable shelf tiles, smart search, and the 4-mode Taste Compass recommendation engine. |
| **D2: Cultural AI Gateway Engine** | API Routes + Python Client | `app/api/`, `src/qloo_client.py` | Qloo API v2 gateway (`/search` canonical UUID resolver & `/v2/insights` affinity engine) + resilient metadata fallback pipeline. |
| **D3: Complete Documentation Suite** | Markdown (`.md`) | Root Directory | `DELIVERABLES.md`, `VISION.md`, `ARCHITECTURE.md`, `DESIGN.md`, `README.md`. |
| **D4: Hackathon Pitch & Submission Package** | Text & Video Script | `DELIVERABLES.md` (Section 8) | Ready-to-publish Devpost copy, 3-minute video recording script, judge demo walk-through, and seed preset. |

---

## 4. Feature-by-Feature Finished Product Specification

### 4.1 Spatial Liquid Canvas (Nothing OS Aesthetic)
- **Background:** Stark OLED pure canvas (`#FFFFFF` light mode canvas, contrasting with `#000000` deep squircle tiles and dot-matrix telemetry).
- **Physics Engine:** Integrated with Framer Motion spring physics (`stiffness: 450, damping: 22, mass: 1.0`).
- **Tactile Jiggle:** Hovering or tapping tiles triggers elastic micro-expansion and playful organic rotation (`rotate: [-1.5deg, 1.5deg, 0deg]`).
- **Draggable Tiles:** Shelf blocks can be dragged spatially on the canvas with elastic bounce-back bounds.
- **Collage Thumbnails:** Each shelf block displays an automatic 2x2 collage of real cover art or a single hero poster.

### 4.2 Domain-Aware Multi-Shelves
TasteMem natively supports 5 fundamental cultural verticals:
1. **Anime Vault (`anime`):** Track series and films with studio, episode context, and high-res anime art.
2. **Cinema & TV Records (`movies`):** Track feature films and prestige television with director, year, and theatrical artwork.
3. **Vinyl & Sound Rotation (`music`):** Track albums, EPs, and artists with official 600x600 album sleeves.
4. **Literature & Essays (`books`):** Track fiction, non-fiction, and design monographs with cover art and authors.
5. **Places & Cafés (`places`):** Track specialty roasters, bistros, and urban sanctuaries with location coordinates and photography.

### 4.3 Universal Smart Add & Zero-Friction Ingestion Pipeline
- **Modal Workflow:** Domain-locked search modal accessible from inside any shelf or via universal shortcut.
- **Debounced Instant Search (350ms):** Queries zero-auth metadata APIs as the user types.
- **One-Click Selection:** Instantly extracts high-res cover art, canonical title, release year, and synopsis.
- **Human Memory Plaque:** An optional, single input field for the user's authentic memory (*"watched on a rainy Sunday; soundtrack gave me goosebumps"*).
- **Asynchronous Silent Qloo Linking:** When saved, the client triggers a non-blocking background lookup against Qloo `/search`, extracting and binding the canonical `qloo_entity_id` UUID without delaying the UI.

### 4.4 The Taste Compass — 4 Recommendation Modes
The core cultural intelligence engine accessible directly from the canvas via the **Taste Compass**:

```
┌────────────────────────────────────────────────────────┐
│             🧭 TASTE COMPASS MODES                     │
├────────────────────────────────────────────────────────┤
│ 1. [MORE LIKE THIS]  Direct high-affinity domain match │
│ 2. [SURPRISE ME]     Indie gems (popularity <= 0.60)   │
│ 3. [GO WILD]         Cross-domain leaps across shelves │
│ 4. [TRIP GUIDE]      Location-grounded city discovery  │
└────────────────────────────────────────────────────────┘
```

1. **Mode 1: "More Like This" (Direct Taste Affinity)**
   - *Target:* Same domain as the anchor items.
   - *Logic:* Feeds active shelf UUIDs into Qloo `/v2/insights` with `sort_by=affinity`.
   - *Use Case:* "Give me anime films matching *Spirited Away* and *Cowboy Bebop*."

2. **Mode 2: "Surprise Me" (Adjacent Indie Discovery)**
   - *Target:* Same domain, but mainstream blockbusters are filtered out.
   - *Logic:* Sets `filter.popularity.max: 0.60` with high cultural affinity.
   - *Use Case:* Discovering underground cinema or indie shoegaze bands you've never heard of.

3. **Mode 3: "Go Wild" (Cross-Domain Leap — Hackathon Star Feature)**
   - *Target:* Crosses boundaries between shelves (e.g. Anime + Dining -> Books or Music).
   - *Logic:* Aggregates multi-shelf entity UUIDs as `signal.interests.entities`, targeting an entirely different `filter.type` (e.g. `urn:entity:book` or `urn:entity:brand`).
   - *Use Case:* "I love *Ghibli* and *Artisan Ramen*; what literature and vinyls match my taste?" Qloo empirically correlates and reveals Haruki Murakami, Joe Hisaishi, and boutique Japanese stationary brands.

4. **Mode 4: "Trip & City Guide" (Location-Grounded Discovery)**
   - *Target:* Places & dining entities filtered by a target city name.
   - *Logic:* Passes universal taste signals with `filter.location: <CityName>` and `filter.type: urn:entity:place`.
   - *Use Case:* "I am traveling to Tokyo; recommend cafés and record bars that align with my universal taste vault."

### 4.5 Cultural Affinity Badges & Reasoning Explainability
Every recommendation card returned by TasteMem displays:
- **Affinity Percentage:** Empirically calculated score (e.g. `94% CULTURAL AFFINITY`).
- **Domain Badge:** Distinct monospace indicator (`:: LITERATURE`, `:: CINEMA`).
- **Bridge Reasoning:** Natural-language explainability explaining why this item connects to the user's specific shelf entries (*"Connected to your affinity for Hayao Miyazaki and atmospheric world-building"*).
- **1-Click "Pin to Shelf":** Instant action allowing the user to immediately pin the recommended item into one of their vaults.

### 4.6 Local-First Data Vault & Instant Portability
- **Zero Authentication Wall:** Operates immediately without email, password, or third-party OAuth.
- **LocalStorage Persistence:** State is persisted continuously under `tastemem_shelves_v1`.
- **Pre-Seeded Demonstration State:** Comes pre-populated with curated aesthetic seed vaults (*Anime Vault*, *Late Night Cinema*, *Vinyl & Shoegaze*) so judges and new users experience instant gratification.
- **1-Click JSON Backup:** Export and import full vault state with zero data loss.

---

## 5. Anti-Bloat & Anti-Clutter Manifesto (Out-of-Scope Guardrails)

In strict adherence to the project's building philosophy, the following features are **explicitly out of scope** to ensure zero bloat:

| Excluded Feature | Rationale for Exclusion |
| :--- | :--- |
| ❌ **Social feeds & follower counts** | TasteMem is an intimate personal memory vault, not a dopamine-farming social network. |
| ❌ **Public comments & reviews** | Users should record authentic personal notes without performing for an audience. |
| ❌ **Complex rich-text / Markdown editor** | A single memory note plaque keeps inputs concise and preserves visual rhythm. |
| ❌ **Mandatory signup / login walls** | Frictionless demo and immediate cold-start utility. |
| ❌ **Sponsored ads or affiliate carousels** | Preserves pure, objective cultural graph affinities. |

---

## 6. System Architecture & External Integrations

### 6.1 Full Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BROWSER CLIENT                                  │
│                                                                                 │
│   ┌─────────────────────┐    ┌─────────────────────┐    ┌───────────────────┐   │
│   │   Shelf Canvas      │    │  Universal Smart    │    │   Taste Compass   │   │
│   │   (Framer Motion)   │    │  Add Modal          │    │   (4 Modes)       │   │
│   └──────────┬──────────┘    └──────────┬──────────┘    └─────────┬─────────┘   │
│              │                          │                         │             │
│              ▼                          ▼                         ▼             │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │              Local State & Storage Layer (localStorage)                 │   │
│   └─────────────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────────────┼───────────────────────────────────────┘
                                          │ Next.js API Routes / HTTP
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TASTEMEM GATEWAY SERVICES                             │
│                                                                                 │
│   ┌───────────────────────────────┐     ┌───────────────────────────────────┐   │
│   │      /api/search Route        │     │       /api/recommendations        │   │
│   │   Multi-domain metadata search│     │       Taste graph orchestration   │   │
│   └──────────────┬────────────────┘     └─────────────────┬─────────────────┘   │
└──────────────────┼────────────────────────────────────────┼─────────────────────┘
                   │                                        │
         ┌─────────┴─────────┐                    ┌─────────┴─────────┐
         ▼                   ▼                    ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐ ┌────────────────────┐
│ AniList GraphQL │ │ iTunes / Deezer │ │ Qloo /search     │ │ Qloo /v2/insights  │
│ (Free, 0-Auth)  │ │ (Free, 0-Auth)  │ │ (Entity UUIDs)   │ │ (Affinities Graph) │
├─────────────────┤ ├─────────────────┤ └──────────────────┘ └────────────────────┘
│ TMDB / Books    │ │ Geoapify Places │
└─────────────────┘ └─────────────────┘
```

### 6.2 Qloo Cultural AI Gateway Specification

All taste graph calls target the official Hackathon gateway:
- **Base URL:** `https://hackathon.api.qloo.com`
- **Mandatory Header:** `X-Api-Key: <QLOO_API_KEY>`
- *(Notice: `Authorization: Bearer` is strictly rejected with HTTP 401).*

#### Endpoint 1: Entity UUID Resolution (`/search`)
```http
GET https://hackathon.api.qloo.com/search?query=Spirited+Away&types=urn:entity:movie&take=1
X-Api-Key: <QLOO_API_KEY>
```
*Response mapping:* Extracts canonical `entity_id` and binds it to `item.qlooEntityId`.

#### Endpoint 2: Cross-Domain Insights (`/v2/insights`)
```http
GET https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:book&signal.interests.entities=UUID_1,UUID_2&sort_by=affinity&take=6
X-Api-Key: <QLOO_API_KEY>
```
*Response mapping:* Extracts `results.entities[]` with affinity calculations, canonical titles, and correlated properties.

### 6.3 Multi-Domain Free Metadata Pipeline

To guarantee 100% reliability with zero credit-card dependencies, the metadata pipeline integrates:

| Domain | Provider | Endpoint | Cover Asset |
| :--- | :--- | :--- | :--- |
| **Anime** | AniList GraphQL | `https://graphql.anilist.co` | `coverImage.extraLarge` (Official HD art) |
| **Cinema / TV** | iTunes Movies & TMDB | `https://itunes.apple.com/search?media=movie` | `artworkUrl100` upscaled to 600x600 |
| **Music** | iTunes Search & Deezer | `https://itunes.apple.com/search?entity=album` | `artworkUrl100` upscaled to 600x600 |
| **Books** | Google Books API | `https://www.googleapis.com/books/v1/volumes` | `thumbnail` (High-res book jackets) |
| **Places** | Geoapify & Wikimedia | `https://api.geoapify.com/v2/places` | Curated Wikimedia Commons location photography |

---

## 7. End-to-End User Journeys

### Journey 1: Cold Start to Wow (< 30 Seconds)
1. User opens TasteMem in browser.
2. The canvas immediately presents 3 pre-seeded, tactile vaults: *Anime Vault* (3 items), *Late Night Cinema* (2 items), and *Vinyl & Shoegaze* (2 items).
3. User hovers or taps any tile: the tile squishes and jiggles with liquid spring physics.
4. Total time to visual engagement: **5 seconds**.

### Journey 2: Logging a New Memory
1. User taps the *Anime Vault* tile. The view morphs into the full-screen vault.
2. User taps `[+ ADD ANIME]`. The Smart Add modal opens with domain locked to `anime`.
3. User types `"Chainsaw Man"`. Within 350ms, official cover art and synopses appear.
4. User taps the result, types a note: *"Aki Hayakawa kitchen scene broke my heart"*, and taps `[SAVE TO SHELF]`.
5. The card instantly drops into the vault with a fluid spring animation. In the background, Qloo's UUID is linked.

### Journey 3: Experiencing Cross-Domain Discovery ("Go Wild")
1. User taps the **Taste Compass** button on the bottom navigation.
2. User selects the **"Go Wild"** mode.
3. TasteMem aggregates the user's active taste entities across anime and cinema, and targets **Books & Literature**.
4. Qloo traverses the taste graph and surfaces Haruki Murakami's *Kafka on the Shore* and Philip K. Dick's *Do Androids Dream of Electric Sheep?* with a **93% Cultural Affinity** score.
5. User clicks `[PIN TO BOOKS SHELF]`: a new vault is automatically created or populated.

---

## 8. Hackathon Submission & Presentation Package

### 8.1 Devpost Submission Pitch

#### Project Title
**TasteMem — Your Personal Cultural Shelf (Powered by Qloo AI)**

#### Short Description (Tagline)
Organize everything you've loved across anime, cinema, music, and places in a tactile liquid vault—unlocking mathematically grounded cross-domain recommendations via Qloo's 575M+ cultural graph.

#### Inspiration
We all love culture, but our taste is fractured across five different apps: MyAnimeList, Letterboxd, Spotify, Goodreads, and Google Maps bookmarks. None of these apps understand that our love for a specific anime director directly correlates with our coffee preferences or the literature we'd enjoy. Meanwhile, generic LLMs hallucinate recommendations without cultural grounding. We built **TasteMem** to give people a tactile, visual home for their cultural memories, and connected it directly to Qloo to turn personal taste vaults into an intelligent cross-domain discovery engine.

#### What it Does
- **Tactile Liquid Canvas:** Auto-arranging, draggable shelf blocks inspired by Nothing OS and Teenage Engineering with gelatinous physics.
- **Universal Smart Add:** Instantly searches across Anime, Cinema, Music, Books, and Places with zero-friction cover art fetching and personal human memory plaques.
- **The Taste Compass (4 Modes):**
  1. *More Like This:* Direct taste affinity.
  2. *Surprise Me:* Discovers hidden gems by capping popularity at 60%.
  3. *Go Wild:* Bridges disparate shelves (e.g. Anime + Dining -> Books & Music).
  4. *Trip Guide:* Recommends local cultural venues grounded in the user's universal taste fingerprint.

#### How We Built It
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion for liquid physics, Lucide Icons.
- **Cultural Intelligence:** Qloo Hackathon Gateway (`https://hackathon.api.qloo.com`) utilizing `/search` for canonical entity resolution and `/v2/insights` for cross-category affinity traversal.
- **Metadata Pipeline:** Free, zero-auth public APIs (AniList GraphQL, Apple iTunes Search, Google Books, Geoapify).
- **Backend & Python SDK:** Next.js Route Handlers alongside an asynchronous Python FastAPI client (`src/qloo_client.py`).

---

### 8.2 3-Minute Video Demo Narrative Script

| Time | Screen Action | Voiceover Script |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Open blank tab, navigate to TasteMem. Hover over jiggling shelf tiles. | *"Culture is fragmented. You track anime on MAL, films on Letterboxd, music on Spotify, and cafés on Google Maps. None of them talk to each other. Meet TasteMem: your tactile personal cultural shelf, powered by Qloo's Cultural AI."* |
| **0:25 - 0:55** | Drag a shelf tile, open *Anime Vault*, scroll through posters and memory notes. | *"Notice the interface: inspired by Nothing OS, it's pure monochrome, tactile, and fluid. Every block has physical weight and jiggle. Here's my Anime Vault, with high-res cover art and my personal notes."* |
| **0:55 - 1:30** | Tap `[+ ADD ANIME]`, type "Cowboy Bebop", select it, add note, save. | *"Adding a memory is effortless. I search a title, TasteMem pulls official cover art in real time, I record my personal memory, and save it. Silently in the background, TasteMem resolves this title to Qloo's 575M+ entity graph."* |
| **1:30 - 2:20** | Open **Taste Compass**, switch to **"Go Wild"**, select Literature target. | *"Now for the magic: the Taste Compass. Let's go to 'Go Wild'. Instead of staying in anime, we ask Qloo: based on my anime and cinema tastes, what books should I read? Qloo traverses the cultural graph and recommends Haruki Murakami and Philip K. Dick with verified 94% affinity."* |
| **2:20 - 2:45** | Switch to **"Trip Guide"**, type "Tokyo", see local coffee spots. | *"Traveling to Tokyo? The Trip Guide projects my universal taste fingerprint onto Tokyo venues, surfacing specialty kissaten cafés and vinyl bars matching my exact vibe."* |
| **2:45 - 3:00** | Return to canvas, show full vault summary. | *"Zero clutter, zero social feeds, pure cultural intelligence. That is TasteMem. Thank you."* |

---

### 8.3 The 30-Second Judge "Aha!" Moment Protocol

When a hackathon judge opens the live deployment, they will experience the "Aha!" moment in 3 simple steps:
1. **Touch & Feel (0-10s):** Drag or tap any squircle shelf on the canvas. The liquid spring physics and high-contrast OLED aesthetic instantly stand out from generic hackathon UI templates.
2. **Add a Memory (10-20s):** Open any vault, tap `+ ADD`, type their favorite movie or artist. Within 300ms, official cover art appears.
3. **Trigger "Go Wild" (20-30s):** Tap the Taste Compass, trigger "Go Wild", and watch Qloo connect their cinema taste to surprising books or music with real affinity scores.

---

## 9. Verification & Acceptance Criteria

### 9.1 Functional Verification Checklist
- [x] **Canvas Rendering:** Auto-arranging responsive grid with squircle tiles.
- [x] **Tactile Physics:** `framer-motion` spring animations, jiggle on hover/tap, and draggable bounds.
- [x] **Smart Add Modal:** Debounced search against AniList (anime), iTunes/TMDB (cinema), iTunes/Deezer (music), Google Books (literature).
- [x] **Qloo UUID Resolution:** `/api/qloo/resolve` queries `https://hackathon.api.qloo.com/search` with `X-Api-Key`.
- [x] **Local Persistence:** Changes persist reliably across browser reloads via `localStorage`.
- [x] **Taste Compass Engine:** Implements the 4 distinct modes ("More Like This", "Surprise Me", "Go Wild", "Trip Guide").
- [x] **Explainability Badges:** Displays affinity percentages and cross-domain reasoning badges.

### 9.2 Reliability & Security Standards
- **API Key Protection:** Qloo API key is stored securely in environment variables (`.env`) and only accessed via server-side route handlers.
- **Fail-Safe Fallbacks:** If an external metadata API rate-limits or fails, the app falls back to secondary providers (e.g. iTunes -> Deezer).
- **Zero Console Errors:** Clean React hydration and strict TypeScript compilation.

---

## 10. Directory Structure of Deliverables

```
qloo-agentic-hackathon/
├── DELIVERABLES.md            # Master Finished Product & Delivery Specification (This Document)
├── VISION.md                  # Product Vision, Problem Statement & Manifesto
├── ARCHITECTURE.md            # System Architecture, Component Flows & Qloo Specs
├── DESIGN.md                  # Liquid Monochrome Design Tokens & Physics Specs
├── README.md                  # Quickstart, Setup Guide & Overview
├── package.json               # Next.js 15, React 19, Framer Motion dependencies
├── tailwind.config.ts         # Custom squircle radii, font families, dark OLED tokens
├── app/
│   ├── layout.tsx             # Root layout with font imports
│   ├── page.tsx               # Main Spatial Liquid Canvas playground
│   ├── globals.css            # OLED dark styling, typography definitions
│   └── api/
│       ├── search/            # Multi-domain metadata ingestion route
│       │   └── route.ts
│       ├── qloo/
│       │   ├── resolve/       # Qloo canonical UUID resolution route
│       │   └── route.ts
│       └── recommendations/   # Qloo /v2/insights 4-mode engine route
│           └── route.ts
├── components/
│   ├── ShelfBlock.tsx         # Draggable squircle shelf block with collage
│   ├── ShelfDetailView.tsx    # Full-screen vault inspection view
│   ├── SmartAddModal.tsx      # Debounced search, cover art, and memory note modal
│   ├── CreateShelfModal.tsx   # Spawn new vault tile modal
│   └── TasteCompassModal.tsx  # 4-mode Qloo cross-domain discovery engine
└── src/
    ├── qloo_client.py         # Asynchronous Python client for Qloo Gateway
    ├── app.py                 # FastAPI backend entrypoint
    ├── types/
    │   └── index.ts           # TypeScript interfaces (Shelf, ShelfItem, Domain, Recs)
    └── lib/
        ├── physics.ts         # Framer Motion spring constants & jiggle keyframes
        └── storage.ts         # LocalStorage persistence & pre-seeded vaults
```
