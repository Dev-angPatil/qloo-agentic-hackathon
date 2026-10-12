# 🏛️ TasteMem — System Architecture & Technical Specifications

This document defines the technical architecture, data flows, external service integrations, and runtime boundaries of **TasteMem**.

---

## 1. System Overview & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER (Mobile App / PWA)                │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│   │ Visual Shelves Grid │  │ Universal Smart Add │  │ Recs / Go Wild │ │
│   │ (Anime, Films, etc) │  │ (Auto-detect + art) │  │ (4 Mode Engine)│ │
│   └──────────┬──────────┘  └──────────┬──────────┘  └────────┬───────┘ │
│              └────────────────────────┼──────────────────────┘         │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │ HTTP / JSON
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND ENGINE LAYER (FastAPI / Python)              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ /api/search/detect                                             │   │
│   │ Detects category, queries Metadata API, returns posters + desc │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                   │
│   ┌────────────────────────────────▼───────────────────────────────┐   │
│   │ /api/shelves (CRUD)                                            │   │
│   │ Persists items to SQLite / Local Store + triggers Qloo link   │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                   │
│   ┌────────────────────────────────▼───────────────────────────────┐   │
│   │ /api/recommendations                                           │   │
│   │ Traverses user taste UUIDs via Qloo /v2/insights               │   │
│   │ Supports: "More Like This", "Surprise", "Go Wild", "Trip"      │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────────┐
│     EXTERNAL MEDIA & METADATA APIS    │  │       QLOO CULTURAL AI GATEWAY    │
│                                       │  │                                   │
│ • Anime: AniList GraphQL              │  │ Base: https://hackathon.api.qloo.com
│ • Movies/TV: TMDB API                 │  │ Auth: X-Api-Key: <QLOO_API_KEY>   │
│ • Music: Deezer API                   │  │                                   │
│ • Books: Google Books API             │  │ • /search (Entity UUID resolution)│
│ • Places: Geoapify / Wikimedia        │  │ • /v2/insights (Taste correlations)
└───────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 2. External API Architecture & Media Pipeline

To keep the application **100% free, fast, and reliable** without vendor billing risks, TasteMem integrates the following media providers:

### 2.1 Media & Metadata Providers Table

| Domain | Selected API | Base URL | Auth Mechanism | Rate Limit | Returned Assets |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Anime** | **AniList GraphQL** | `https://graphql.anilist.co` | None (Public POST) | 90 req/min | High-res Cover (`coverImage.extraLarge`), banner, synopsis, genres, score |
| **Movies & TV** | **TMDB API** | `https://api.themoviedb.org/3` | Free API Key (Instant) | ~40 req/10s | Poster paths (`image.tmdb.org/t/p/w500/...`), backdrop, release year, overview |
| **Music** | **Deezer API** | `https://api.deezer.com` | **Zero Auth** (Direct GET) | ~50 req/5s | Album cover (`cover_xl`), artist portrait (`picture_xl`), preview audio |
| **Books** | **Google Books** | `https://www.googleapis.com/books/v1` | Free Key / None | 1,000 req/day | Cover image (`thumbnail`), author, publication year, description |
| **Places / Cafés** | **Geoapify Places** | `https://api.geoapify.com/v2/places` | Free Key (No Credit Card) | 3,000 req/day | Coordinates, category, address, POI metadata |
| **Place Photos** | **Wikimedia / OpenTripMap** | `https://api.opentripmap.com/0.1` | Free Key / None | Generous | High-res Wikimedia Commons photography for landmarks and districts |

---

## 3. Qloo Cultural Intelligence Integration

All cultural affinity calculations and taste graph traversals are executed via the official hackathon gateway:

- **Base URL:** `https://hackathon.api.qloo.com`
- **Required Header:** `X-Api-Key: <QLOO_API_KEY>`

### 3.1 Entity Resolution Pipeline (`/search`)
When a user adds an item (e.g., *"Attack on Titan"* or *"Blue Bottle Coffee"*), TasteMem queries Qloo `/search`:
```http
GET https://hackathon.api.qloo.com/search?query=Attack+on+Titan&types=urn:entity:tv_show&take=1
X-Api-Key: <QLOO_API_KEY>
```
The returned `entity_id` (canonical UUID) is stored alongside the item metadata in the local shelf entry.

### 3.2 Taste Profile Aggregation
The user's taste profile is an array of their collected Qloo entity UUIDs, grouped or filtered by shelf category:
```json
{
  "user_taste_signals": [
    "c8a1496a-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "f2b38190-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "99e12014-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  ]
}
```

### 3.3 The 4 Recommendation Modes via `/v2/insights`

#### Mode 1: "More Like This" (Direct Taste Affinity)
- **Target Filter:** Same domain as the reference shelf (e.g., `filter.type: urn:entity:movie`).
- **Input Signals:** `signal.interests.entities: <uuid_1>,<uuid_2>`
- **Sorting:** `sort_by=affinity`

#### Mode 2: "Surprise Me" (Indie / Hidden Gems)
- **Target Filter:** Same domain.
- **Popularity Cap:** `filter.popularity.max: 0.60` (filters out mainstream blockbusters).
- **Result:** High cultural affinity with undiscovered/indie titles.

#### Mode 3: "Go Wild" (Cross-Domain Bridge)
- **Concept:** User passes Anime and Dining UUIDs, but requests recommendations in **Books**, **Fashion**, or **Music**:
```http
GET https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:book&signal.interests.entities=UUID_ANIME_1,UUID_RESTAURANT_2&sort_by=affinity&take=5
X-Api-Key: <QLOO_API_KEY>
```
- **Result:** Empirically proven correlations (e.g., Ghibli fans who love specialty pour-overs correlate with Haruki Murakami literature and Japanese ceramic brands).

#### Mode 4: "Trip & City Guide" (Location-Grounded)
- **Concept:** Evaluates universal user taste against local venues in a target city:
```http
GET https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:restaurant&filter.location=Tokyo&signal.interests.entities=UUID_1,UUID_2&sort_by=affinity&take=5
X-Api-Key: <QLOO_API_KEY>
```

---

## 4. Data Models & Schemas

### 4.1 Shelf Item Schema (`Item`)
```python
from pydantic import BaseModel
from typing import Optional, List

class ShelfItem(BaseModel):
    id: str                         # Local unique ID (UUID)
    shelf_id: str                   # "anime", "movies", "music", "books", "places"
    title: str                      # e.g., "Spirited Away"
    subtitle: Optional[str]         # e.g., "Hayao Miyazaki, 2001"
    cover_image_url: str            # High-res poster or artwork URL
    description: Optional[str]      # Short synopsis or overview
    user_note: Optional[str]        # Short personal memory / note
    qloo_entity_id: Optional[str]   # Canonical Qloo UUID
    tags: List[str] = []            # e.g., ["Fantasy", "Comfort", "Anime"]
    rating_or_status: Optional[str] # e.g., "Favorite", "Rewatched"
    created_at: str
```

### 4.2 Shelf Collection Schema (`Shelf`)
```python
class Shelf(BaseModel):
    id: str                         # e.g., "anime"
    name: str                       # e.g., "Anime Watched"
    icon: str                       # Lucide icon identifier: "film", "tv", "book", "disc", "map-pin"
    domain: str                     # "anime", "film", "music", "book", "place"
    items: List[ShelfItem] = []
    total_count: int = 0
```

### 4.3 Recommendation Request & Response
```python
class RecommendationRequest(BaseModel):
    mode: str                       # "more_like_this" | "surprise" | "go_wild" | "trip"
    target_category: Optional[str]  # Target domain or "any"
    location: Optional[str]         # e.g., "Tokyo", "London", or None
    seed_item_ids: Optional[List[str]] = None # Optional subset of items to anchor on

class RecommendationResult(BaseModel):
    title: str
    category: str
    cover_image_url: Optional[str]
    description: str
    affinity_score: float           # e.g., 0.88 (88%)
    qloo_entity_id: str
    taste_reasoning: str            # Explaining the cultural bridge to user's shelves
```

---

## 5. Storage Strategy

- **Local-First SQLite Database:** Stored at `data/tastemem.db` via SQLAlchemy / SQLModel.
- **Fast In-Memory Cache:** In-memory caching for metadata API results (AniList/TMDB responses) to minimize external network round-trips.
- **Export / Import:** 1-click JSON export/import for zero-setup data portability across devices.
