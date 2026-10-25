# 🧠 TasteMem — Cultural Taste Intelligence & Vibe Memory

> **"You experience something you love — a film, an album, a café, or just a morning run. You speak or type it in. The AI understands the vibe, files it into your custom life shelves, and unlocks grounded cultural discoveries you never saw coming."**

Built for the **Qloo Agentic AI Hackathon 2026**.

---

## ⚡ Quickstart

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm`
- **Qloo API Key**: Sign up at [docs.qloo.com](https://docs.qloo.com)
- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com)

### 2. Environment Setup
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
Key variables configured in `.env`:
```env
# Cultural AI Graph
QLOO_API_KEY=hack_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini AI Vibe Routing
GEMINI_API_KEY=AQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Cloud Firebase (Project: weekendsahal)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjx1Hw_LLPCN98m2jGQKyktnLgxO0JMWs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=weekendsahal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=weekendsahal
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=weekendsahal.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1059415279275
NEXT_PUBLIC_FIREBASE_APP_ID=1:1059415279275:web:3c894783c9754fda1e59ee
FIREBASE_PROJECT_ID=weekendsahal

# Optional Media Keys (Multi-tier fallbacks automatically engage if blank)
TMDB_API_KEY=
OMDB_API_KEY=
GOOGLE_BOOKS_API_KEY=
```

### 3. Run Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To expose for mobile testing on your local network:
```bash
npm run dev:mobile
```

---

## 🏗️ Architecture & Core Engine

```
TasteMem Client (Infinite Whiteboard Canvas + Liquid Spring Physics)
  │
  ├── Offline-First SyncBridge (localStorage <--> Cloud Firestore)
  │     └── Anonymous Firebase Auth + Real-time Listeners
  │
  ├── /api/vibe (Google Gemini 2.5 Flash)
  │     └── Semantic Note Ingestion -> Vibe Shelves + Canonical Qloo Seeds
  │
  ├── /api/recommendations (Qloo Cultural Graph: /v2/insights)
  │     ├── Mode 1: More Like This (High-affinity cultural resonance)
  │     ├── Mode 2: Surprise Me (Strict indie filtering: popularity <= 0.60)
  │     ├── Mode 3: Go Wild (Cross-domain aesthetic bridge, e.g. run -> vinyl)
  │     └── Mode 4: Trip Guide (WKT bounding polygons for 11 global cities)
  │
  └── /api/search (Multi-Tier Resilient Media Discovery)
        ├── Anime: AniList GraphQL ➔ Jikan (MyAnimeList v4) ➔ Unsplash
        ├── Movies: TMDB ➔ TVMaze (HD posters) ➔ OMDb ➔ iTunes Movie
        ├── Music: iTunes ➔ Deezer
        ├── Books: Google Books ➔ Open Library
        └── Places: Qloo Places ➔ Photon (OpenStreetMap)
```

---

## 📱 Mobile Native Build (Android / Capacitor)

The repository includes a native Android wrapper (`android/`) with Jetpack Compose:
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated under `android/app/build/outputs/apk/debug/app-debug.apk`.
Firebase configuration is pre-wired via `android/app/google-services.json`.

---

## 🧪 Verification & Automated Testing

Run the automated test suites:
```bash
# Verify Qloo 4-Mode Recommendation Engine
npm test

# Run adversarial resilience tests
npm run test:adversarial
npm run test:stress
```

---

## 📜 Prompt History & Delivered Outcomes (Mandatory Rule #2 Log)

| # | Prompt / Request | Key Decisions & Outcomes |
|---|---|---|
| **1** | *"Without touching UI, create a firebase backend, database and make the entire thing working. Understand everything about what is needed from firebase and recommendation engine... /grill-me"* | Executed `/grill-me` design interview. Resolved decisions: 1) Target Firebase project `weekendsahal` (native Firestore provisioned), 2) Anonymous Auth first with instant guest session, 3) Hierarchical Firestore schema under `/users/{userId}/shelves/...`, 4) Gemini 2.5 Flash vibe routing, 5) Isolated non-conflicting sync bridge under `src/lib/firebase/`. |
| **2** | *"Can you make it so the other api keys used to fetch cover pages, anime, movie names etc are also functioning"* | Upgraded `src/lib/metadataFallback.ts` and `app/api/search/route.ts` with multi-tier fallback pipelines (AniList + Jikan for anime, TMDB + TVMaze + OMDb + iTunes for movies, Google Books + Open Library for books, iTunes + Deezer for music). Verified AniList and TVMaze return official high-resolution posters even without keys. |
| **3** | *"You can also do full edit my other agent is done working. You have full access"* | Obtained full write access to integrate frontend and backend directly. Registered Web and Android apps via Firebase MCP. Configured `google-services.json` and `.env`. Installed `firebase`, `firebase-admin`, `@google/genai`. Built `app/api/vibe/route.ts`, `src/lib/firebase/syncBridge.ts`, and hooked real-time synchronization into `app/page.tsx` and `src/lib/storage.ts`. Restored `ARCHITECTURE.md` and `README.md`. |
| **4** | *"run it on my android phone"* | Built debug APK (`./gradlew installDebug`) and installed to physical device `TECNO_CN7c` (`164786766S020745`). Configured `adb reverse tcp:3000 tcp:3000` and `android:usesCleartextTraffic="true"` in `AndroidManifest.xml`. Launched Next.js production server on `0.0.0.0:3000`. Successfully launched `com.example.tastemem/.MainActivity` on the connected smartphone and captured live UI rendering. |
| **5** | *"run it on my connected android phone"* | Connected to authorized physical Android phone (`TECNO_CN7c`, serial `164786766S020745`). Re-verified and installed the latest debug build (`./gradlew installDebug`). Started the mobile Next.js server (`npm run dev:mobile` on `0.0.0.0:3000`), established the USB port forward (`adb reverse tcp:3000 tcp:3000`), and launched `com.example.tastemem/.MainActivity`. Captured live screenshot confirming TasteMem whiteboard UI rendered directly on the device screen. |


