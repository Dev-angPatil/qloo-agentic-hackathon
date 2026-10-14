# 🧠 TasteMem — Your Personal Cultural Shelf

> **Every experience you've loved, organized visually. Cross-domain recommendations, powered by Qloo's Cultural AI.**

[![Hackathon](https://img.shields.io/badge/Devpost-Qloo%20Agentic%20Hackathon-blue)](https://qloo.devpost.com/)
[![Target Base URL](https://img.shields.io/badge/API-hackathon.api.qloo.com-cyan)](https://hackathon.api.qloo.com)
[![Auth Header](https://img.shields.io/badge/Auth-X--Api--Key-gold)](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Documentation Index

| Document | Purpose & Key Contents |
|---|---|
| **[DELIVERABLES.md](DELIVERABLES.md)** | **Complete Finished Product & Delivery Guide:** End-to-end specifications of all deliverables, the 4 recommendation modes, Devpost pitch, 3-minute video recording script, 30-second judge "Aha!" moment protocol, and acceptance criteria. |
| **[VISION.md](VISION.md)** | **Product Vision & Core Problem:** Why single-domain trackers fail, target persona, the visual shelf concept, 4 recommendation modes ("More Like This", "Surprise Me", "Go Wild", "Trip Guide"), and anti-clutter manifesto. |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | **System Architecture & Technical Specs:** Component diagrams, metadata & cover art API pipeline (AniList, TMDB, Deezer, Google Books, Geoapify), Qloo Cultural AI integration (`/search` & `/v2/insights`), and data models. |
| **[DESIGN.md](DESIGN.md)** | **Design System Tokens:** Nothing OS inspired liquid monochrome design tokens, typography hierarchy, tactile Framer Motion physics tokens, and squircle layouts. |

---

## 🎯 What is TasteMem?

People track their cultural lives across fragmented apps—**MyAnimeList** for anime, **Letterboxd** for movies, **Goodreads** for books, **Spotify** for music, and **Google Maps** for food and travel. None of them talk to each other, and generic LLMs give hallucinated, mainstream recommendations.

**TasteMem** is a unified visual shelf where you log things you love:
1. **Visual Shelves:** Add anime, movies, places, books, and music with automatic cover art fetching and your personal short memory.
2. **Silent Taste Graph Ingestion:** Every logged item is automatically mapped to canonical entities in **Qloo's 575M+ cultural entity graph**.
3. **Cross-Domain Recommendations ("Go Wild"):** Ask for recommendations grounded in your actual taste. Qloo connects the dots across domains—discovering how your anime and ramen preferences correlate with specific indie books, musicians, or travel destinations.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Qloo Hackathon API key ([Developer Guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide))

### 2. Installation & Configuration
```bash
# Clone the repository
git clone https://github.com/Dev-angPatil/qloo-agentic-hackathon.git
cd qloo-agentic-hackathon

# Install Node dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and enter your QLOO_API_KEY:
# QLOO_API_KEY=your_qloo_hackathon_api_key_here
```

### 3. Run Application
```bash
# Start Next.js development server
npm run dev

# Or run optimized production build
npm run build
npm run start
```
Navigate to `http://localhost:3000` to interact with your personal cultural shelves and the Taste Compass.

---

## 🧪 Automated Test Verification

TasteMem includes a complete automated testing harness asserting all 4 recommendation modes, popularity ceilings, cross-domain mappings, and image reachability against live Qloo Hackathon endpoints:

```bash
# Run contract & schema verification (7 assertions)
npm run test

# Run empirical & adversarial multi-domain tests (31 assertions)
npm run test:adversarial

# Run stress & latency boundary tests (26 assertions)
npm run test:stress
```

---

## 🔑 Qloo API Authentication Protocol

> ⚠️ **CRITICAL AUTHENTICATION NOTICE:**
> - **Production Hackathon Base URL:** `https://hackathon.api.qloo.com`
> - Hackathon API keys **only** function against `https://hackathon.api.qloo.com`. Calling other URLs returns `401 Unauthorized`.
> - **Authentication Header:** The gateway strictly requires `X-Api-Key: <key>`.
> - **Do NOT use:** `Authorization: Bearer <key>` (this fails with `401 Unauthorized`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
