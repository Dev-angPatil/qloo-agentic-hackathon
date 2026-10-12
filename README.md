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
| **[VISION.md](VISION.md)** | **Product Vision & Core Problem:** Why single-domain trackers fail, target persona, the visual shelf concept, 4 recommendation modes ("More Like This", "Surprise Me", "Go Wild", "Trip Guide"), and anti-clutter manifesto. |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | **System Architecture & Technical Specs:** Component diagrams, metadata & cover art API pipeline (AniList, TMDB, Deezer, Google Books, Geoapify), Qloo Cultural AI integration (`/search` & `/v2/insights`), and data models. |
| **[DESIGN.md](DESIGN.md)** | **Design System Tokens:** Curatorial dark palette, typography hierarchy, visual shelf card layouts, and mobile-first principles. |

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
- Python 3.10+
- Node.js 18+ (for frontend app)
- Qloo Hackathon API key ([Developer Guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide))

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Dev-angPatil/qloo-agentic-hackathon.git
cd qloo-agentic-hackathon

# Setup virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and enter your QLOO_API_KEY
```

### 3. Run Development Server
```bash
uvicorn src.app:app --reload --port 8000
```
Navigate to `http://localhost:8000/docs` to inspect the Swagger API documentation.

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
