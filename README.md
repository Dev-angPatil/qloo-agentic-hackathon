# 🧠 Qloo Agentic Hackathon

> **Agents, but with taste.**

[![Hackathon](https://img.shields.io/badge/Devpost-Qloo%20Agentic%20Hackathon-blue)](https://qloo.devpost.com/)
[![Deadline](https://img.shields.io/badge/Deadline-Oct%2030%2C%202026-red)](https://qloo.devpost.com/)
[![Prizes](https://img.shields.io/badge/Prizes-%2425%2C000%20%2B%20%2425K%20Investment-gold)](https://qloo.devpost.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🏆 Hackathon Overview

| Detail | Info |
|--------|------|
| **Hackathon** | [Qloo Agentic Hackathon](https://qloo.devpost.com/) |
| **Timeline** | Sep 30 – Oct 30, 2026 |
| **Format** | Online, Public |
| **Prizes** | $25,000 in cash ($15K / $6K / $4K) |
| **Bonus** | Jason Calacanis will personally invest **$25,000** into his favorite entry |
| **Theme** | Machine Learning / AI |

### Judges

- **Jason Calacanis** — American Entrepreneur & Angel Investor / Bestie
- **Mike Diolosa** — CTO, Qloo
- **Nicole Seligman** — Member, OpenAI Board of Directors
- **Todd Boehly** — Co-founder, Chairman & CEO, Eldridge Industries
- **Cedric the Entertainer** — Actor, Comedian, Producer
- **Michael Abrams** — EVP Strategic Initiatives, Live Nation Entertainment

---

## 🎯 What is Qloo?

**Qloo** is the world's leading **Cultural AI** platform. Founded in 2012, it uses a proprietary **Taste Graph** of **250M+ entities** across lifestyle domains to predict and understand consumer preferences — all without relying on personally identifiable information (PII).

### Domains Covered
- 🎵 Music
- 🎬 Film & TV
- 🍽️ Dining & Restaurants
- 👗 Fashion & Brands
- ✈️ Travel & Destinations
- 📚 Books & Literature
- 🎭 Nightlife & Entertainment
- 🏨 Hotels & Hospitality

### Key Capabilities (via API)
| Capability | Description |
|------------|-------------|
| **Insights API** | Get taste-based recommendations, cultural affinities, and cross-category correlations |
| **Search Entities** | Search across 250M+ entities by name, type, or attributes |
| **Demographic Insights** | Understand audience demographics for any entity |
| **Heatmap Insights** | Geographic popularity and cultural heat mapping |
| **Taste Analysis** | Deep dive into why entities are connected culturally |
| **Location Intelligence** | Analyze cultural characteristics of specific geographies |

### Backed By
Leonardo DiCaprio, Elton John, Barry Sternlicht (Starwood Hotels), and more.

### Consumer Product
Qloo owns **[TasteDive](https://tastedive.com)** — a consumer-facing recommendation engine.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+ (or Node.js 18+)
- A Qloo API key ([Get yours here](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide#getting-your-api-key))

### Setup

```bash
# Clone the repo
git clone https://github.com/Dev-angPatil/qloo-agentic-hackathon.git
cd qloo-agentic-hackathon

# Create environment file
cp .env.example .env
# Add your QLOO_API_KEY to .env

# Install dependencies (Python example)
pip install -r requirements.txt

# Run the app
python main.py
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `QLOO_API_KEY` | Your Qloo API key for hackathon access | ✅ |

---

## 📚 Qloo API Reference

- **Developer Guide**: [docs.qloo.com/reference/qloo-llm-hackathon-developer-guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide)
- **API Overview**: [docs.qloo.com/reference/api-overview](https://docs.qloo.com/reference/api-overview)
- **API Examples (Recipes)**: [docs.qloo.com/recipes](https://docs.qloo.com/recipes)
- **Insights API Deep Dive**: [docs.qloo.com/reference/insights-api-deep-dive](https://docs.qloo.com/reference/insights-api-deep-dive)

### Quick API Example

```python
import requests

QLOO_API_KEY = "your_api_key_here"
BASE_URL = "https://api.qloo.com/v1"

# Search for entities
response = requests.get(
    f"{BASE_URL}/search",
    headers={"Authorization": f"Bearer {QLOO_API_KEY}"},
    params={"query": "Italian restaurant", "type": "restaurant"}
)

print(response.json())
```

---

## 📋 Submission Requirements

Your submission **must** include:

- [x] ✅ A link to a **functional demo** application (live, hosted, end-to-end)
- [x] ✅ A URL to a **public code repository** (this repo)
- [x] ✅ A **text description** of what your project does
- [x] ✅ **Externally hosted** demo (live website/web app, hosted APK, or TestFlight)
- [x] ✅ An **open-source license** (MIT) visible in the repo

> ⚠️ Demo videos are **NOT** required. Judges will use the live demo directly.

### Judging Criteria

| Criteria | Description |
|----------|-------------|
| **Technological Implementation** | How thoroughly and skillfully does the project use Qloo? |
| **Design** | Does it deliver a complete, coherent product experience? |
| **Potential Impact** | Does it solve a real problem for a real audience? |
| **Quality of the Idea** | Is this a creative, non-obvious use of Qloo? |

---

## 🏗️ Project Structure

```
qloo-agentic-hackathon/
├── README.md              # This file
├── VISION.md              # Product vision and goals
├── ARCHITECTURE.md        # System architecture and design
├── LICENSE                 # MIT License
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── requirements.txt        # Python dependencies
└── src/                    # Source code (TBD)
```

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [Qloo Hackathon (Devpost)](https://qloo.devpost.com/)
- [Qloo API Docs](https://docs.qloo.com/)
- [Qloo Website](https://qloo.com/)
- [TasteDive](https://tastedive.com/)
- [Hackathon Contact](mailto:ian@qloo.com)
