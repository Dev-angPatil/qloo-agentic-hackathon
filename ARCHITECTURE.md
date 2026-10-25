# 🏛️ TasteMem — System Architecture & Technical Specifications

TasteMem is an AI-powered taste memory canvas and cultural discovery engine that transforms personal life notes and cultural memories into custom vibe shelves, fueling serendipitous recommendations via Qloo's 575M+ entity cultural graph.

---

## 1. System Topology & Architecture Diagram

```mermaid
flowchart TB
    subgraph Client [TasteMem Client (Web & Capacitor Native)]
        Canvas[Infinite Vibe Canvas & Liquid Spring Blocks]
        PostIts[Typographic Memory Post-Its]
        CompassModal[Taste Compass 4-Mode Modal]
        LocalStore[(Browser LocalStorage)]
        SyncBridge[Offline-First SyncBridge]
    end

    subgraph FirebaseServices [Google Cloud Firebase (weekendsahal)]
        FAuth[Firebase Auth: Anonymous & Google Linking]
        Firestore[(Cloud Firestore DB)]
    end

    subgraph NextBackend [Next.js Server API Gateway]
        VibeAPI["/api/vibe (POST) - Vibe Ingestion"]
        RecsAPI["/api/recommendations (GET) - 4-Mode Engine"]
        SearchAPI["/api/search (GET) - Multi-Tier Search"]
        ResolveAPI["/api/qloo/resolve (GET) - Canonical Resolver"]
    end

    subgraph AIAndCulture [Cultural AI & Knowledge Graphs]
        GeminiFlash[Google Gemini 2.5 Flash]
        QlooGraph[Qloo Cultural Graph: /v2/insights]
        QlooSearch[Qloo Search: /search]
    end

    subgraph MediaPipelines [Multi-Tier Media Artwork & Metadata]
        AnimeAPI[AniList GraphQL + Jikan MAL v4]
        CinemaAPI[TMDB + TVMaze + OMDb + iTunes Movie]
        MusicAPI[iTunes + Deezer]
        BooksAPI[Google Books + Open Library]
        PlacesAPI[Qloo Places + Photon OSM]
    end

    Canvas <--> LocalStore
    LocalStore <--> SyncBridge
    SyncBridge <--> FAuth
    SyncBridge <--> Firestore

    Canvas --> VibeAPI
    CompassModal --> RecsAPI
    Canvas --> SearchAPI

    VibeAPI --> GeminiFlash
    VibeAPI --> QlooSearch
    RecsAPI --> QlooGraph

    SearchAPI --> AnimeAPI
    SearchAPI --> CinemaAPI
    SearchAPI --> MusicAPI
    SearchAPI --> BooksAPI
    SearchAPI --> PlacesAPI
```

---

## 2. Core Subsystems

### 2.1 Universal Ingestion & Gemini AI Vibe Engine (`/api/vibe`)
- **Model**: `gemini-2.5-flash` via official `@google/genai` SDK.
- **Role**: Ingests raw personal memories ("went for a brisk morning run in the misty rain...") or unverified cultural titles.
- **Outputs**:
  1. Semantic destination shelf (routes into existing shelves e.g. "Morning Fun", or synthesizes a new custom vibe shelf).
  2. Domain classification (`anime`, `movies`, `music`, `books`, `places`).
  3. Evocative atmospheric tags (`["misty", "dawn", "lo-fi", "outdoor"]`).
  4. Plain-English mood reasoning.
  5. Canonical cultural search seeds for Qloo graph queries.

### 2.2 Taste Compass 4-Mode Recommendation Engine (`/api/recommendations`)
- **Gateway**: Targets Qloo's Hackathon endpoint (`https://hackathon.api.qloo.com/v2/insights`) with custom DNS optimization for resilient network resolution.
- **The 4 Modes**:
  1. `more_like_this`: Direct high-affinity cultural resonance.
  2. `surprise_me`: Strict indie filtering (`popularity <= 0.60`, fallback to `0.75`).
  3. `go_wild`: Cross-domain leap (translates personal vibe into alternate artistic mediums e.g. run vibe -> ambient techno vinyl).
  4. `trip_guide`: Geographically grounds user shelf vibe into destination city WKT bounding polygons (Tokyo, Kyoto, London, Paris, NYC, Berlin, SF, LA, Rome, Seoul, Amsterdam).

### 2.3 Cloud Firestore Database & Schema Architecture
- **Project**: `weekendsahal` (Free-tier `FIRESTORE_NATIVE` in `nam5`).
- **Hierarchical Scoping**:
  - `/users/{userId}`: User profile and sync metadata.
  - `/users/{userId}/shelves/{shelfId}`: Vibe shelves (title, domain, itemCount, colorTheme, position, createdAt).
  - `/users/{userId}/shelves/{shelfId}/items/{itemId}`: Media & memory items (title, coverImageUrl, description, userNote, qlooEntityId, domain, rating, memoryStyle, memoryShape, memoryTone, createdAt).
  - `/users/{userId}/canvas_items/{itemId}`: Free-floating notes on the whiteboard canvas.
- **Security Rules (`firestore.rules`)**: Version 2 rules enforcing strict user isolation (`request.auth.uid == userId`) and domain validation.

### 2.4 Offline-First Sync Layer (`src/lib/firebase/syncBridge.ts`)
- **Zero-Latency Local First**: Immediate write to `localStorage` ensures 60 FPS snappy UI response.
- **Background Cloud Synchronization**: Non-blocking asynchronous sync pushes local mutations to Firestore and subscribes to remote snapshots for multi-device sync across Android, iOS, and Web.
- **Anonymous Authentication**: Frictionless onboarding without forced login screens, with optional Google account linking for cross-device persistence.

### 2.5 Multi-Tier Media & Artwork Fallback Pipeline
To ensure search and cover art never break regardless of API limits:
- **Anime**: Tier 1: AniList GraphQL -> Tier 2: Jikan (MyAnimeList v4) -> Unsplash.
- **Movies**: Tier 1: TMDB API -> Tier 2: TVMaze (100% free HD posters) -> Tier 3: OMDb -> Tier 4: iTunes Movie.
- **Music**: Tier 1: iTunes Search (HD 600x600) -> Tier 2: Deezer Search.
- **Books**: Tier 1: Google Books API -> Tier 2: Open Library Covers API.
- **Places**: Tier 1: Qloo Places Graph -> Tier 2: Photon (OpenStreetMap).

---

## 3. Technology Stack Summary

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15.1.7 (App Router), React 19 | Responsive Web, PWA, Server-Side API routes |
| **Styling & Physics** | Tailwind CSS, Framer Motion | Nothing-OS monochrome aesthetic, liquid spring physics |
| **Native Mobile** | Capacitor Android (Kotlin Compose wrapper) | Cross-platform native APK & iOS readiness |
| **Cloud Backend** | Google Cloud Firebase | Auth (Anonymous & OAuth), Cloud Firestore |
| **LLM Reasoning** | Google Gemini 2.5 Flash (`@google/genai`) | High-speed structured JSON note analysis |
| **Cultural AI Graph**| Qloo Cultural AI Hackathon API | 575M+ entity cross-domain affinity graph |
| **Media APIs** | AniList, Jikan, TMDB, TVMaze, iTunes, Deezer, OpenLibrary | Multi-tier cover art and metadata discovery |
