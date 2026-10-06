# 🏗️ ARCHITECTURE

## Overview

> _TBD — High-level description of the system architecture._

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend** | TBD | |
| **Frontend** | TBD | |
| **AI/Agent Framework** | TBD | |
| **External API** | Qloo API | Cultural intelligence & taste graph |
| **Hosting** | TBD | |

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                     User Interface                    │
└─────────────────────────┬────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────┐
│                    Agent Layer                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Reasoning   │  │   Planning   │  │  Execution  │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────┬────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────┐
│               External Services Layer                 │
│  ┌──────────────────┐  ┌───────────────────────────┐ │
│  │   Qloo API       │  │  LLM Provider (Gemini /   │ │
│  │  - Insights      │  │  OpenAI / Claude etc.)    │ │
│  │  - Search        │  │                           │ │
│  │  - Demographics  │  │                           │ │
│  │  - Heatmaps      │  │                           │ │
│  └──────────────────┘  └───────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## Data Flow

> _TBD — Describe how data flows through the system._

## Component Boundaries

> _TBD — Define clear boundaries between components._

## Key Design Decisions

> _TBD — Document important architectural decisions and their rationale._

---

_This document will be updated as the architecture is finalized._
