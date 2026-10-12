---
name: TasteMem Liquid Monochrome Design System
slug: tastemem-liquid-monochrome
version: 2.0.0
description: "A stark, fluid black & white design system inspired by Nothing OS and Teenage Engineering. Features liquid physics, jiggle micro-interactions, draggable spatial blocks, dot-matrix accents, and high-contrast monochrome minimalism."
author: TasteMem Design & Engineering Team
tags:
  - liquid-design
  - monochrome
  - nothing-inspired
  - physics-driven
  - minimalist
  - jiggle-interactions
  - qloo
  - anti-clutter
license: MIT
tokens:
  colors:
    canvas: "#000000"              # Absolute OLED Black
    canvas-subtle: "#0A0A0A"       # Deep Void
    surface-card: "#121212"        # Dark Glass Surface
    surface-elevated: "#181818"    # Tactile Raised Block
    surface-active: "#222222"      # Pressed State
    surface-glass: "rgba(255, 255, 255, 0.04)"
    border-subtle: "rgba(255, 255, 255, 0.08)"
    border-default: "rgba(255, 255, 255, 0.16)"
    border-strong: "rgba(255, 255, 255, 0.35)"
    border-active: "#FFFFFF"
    text-primary: "#FFFFFF"        # Stark Pure White
    text-secondary: "#A3A3A3"      # Cool Medium Silver
    text-muted: "#525252"          # Muted Dim
    text-inverted: "#000000"       # Text on white buttons
    accent-white: "#FFFFFF"        # Solid Action Fill
    accent-dot: "rgba(255, 255, 255, 0.25)"
  fonts:
    display: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    dotmatrix: "'Doto', 'Space Mono', 'NDot', monospace"
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace"
  physics:
    spring-stiff:
      stiffness: 400
      damping: 25
      mass: 0.8
    spring-liquid:
      stiffness: 260
      damping: 18
      mass: 1.0
    spring-jelly:
      stiffness: 500
      damping: 14
      mass: 0.5
    jiggle-keyframes:
      rotate: [-1.5, 1.5, -0.8, 0.8, 0]
      scale: [1, 1.03, 0.98, 1.01, 1]
  radii:
    none: "0px"
    sm: "8px"
    md: "14px"
    lg: "24px"                     # Smooth Squircle Card
    xl: "32px"                     # Fluid Shelf Block
    pill: "9999px"
---

# ⚪⚫ TasteMem Design System — Liquid Monochrome

> **Design Archetype:** Liquid Black & White (Nothing-inspired)  
> **Aesthetic Philosophy:** Tactile OLED minimalism, fluid liquid physics, gelatinous micro-interactions, dot-matrix telemetry, zero noise.

---

## 1. Aesthetic Identity: Inspired by Nothing

The visual language marries the hardware-software minimalism of **Nothing (Nothing OS / Teenage Engineering)** with a fluid, tactile spatial playground:

1. **Absolute Black & White:**
   - Background is absolute OLED Black (`#000000`).
   - Cards, text, and icons operate in pure monochromatic tones (White `#FFFFFF`, Muted Grays `#A3A3A3` / `#525252`, Dark Surfaces `#121212`).
   - No garish neon colors or distracting gradients. Contrast and geometry do all the storytelling.

2. **Liquid Physics & Tactile "Jiggle":**
   - Every block on the screen has physical mass, fluid inertia, and tension.
   - **On Touch / Tap:** Elements slightly squish (`scale: 0.96`), give a playful jelly spring bounce (`spring-jelly`), and jiggle organically (`rotate: [-1.5deg, 1.5deg, 0deg]`).
   - **Draggable Shelf Blocks:** Shelf squares float on the canvas and can be dragged around naturally with momentum and spring bounds.

3. **Dot-Matrix & Mechanical Accents:**
   - Subtle dot-matrix typography and dotted border guidelines for counts and telemetry (`14 ENTRIES`, `91% AFFINITY`).
   - Squircles (`rounded-3xl` / `rounded-[28px]`) with delicate 1px translucent borders (`border-white/10`).

---

## 2. Spatial Canvas & Shelf Blocks

```
┌─────────────────────────────────────────────────────────────┐
│  TASTEMEM : // CANVAS (Pure OLED Black)                     │
│                                                             │
│    ┌────────────────────────┐    ┌────────────────────────┐ │
│    │ ┌────┐ ┌────┐          │    │ ┌─────────┐            │ │
│    │ └────┘ └────┘          │    │ └─────────┘            │ │
│    │                        │    │                        │ │
│    │ ANIME VAULT            │    │ TOKYO CAFÉS            │ │
│    │ :: 14 ITEMS            │    │ :: 08 SPOTS            │ │
│    └────────────────────────┘    └────────────────────────┘ │
│         (Jiggles on touch)            (Draggable tile)      │
│                                                             │
│    ┌────────────────────────┐    ┌────────────────────────┐ │
│    │ ┌────┐                 │    │         ┌───┐          │ │
│    │ └────┘                 │    │         │ + │          │ │
│    │                        │    │         └───┘          │ │
│    │ LATE NIGHT CINEMA      │    │ NEW SHELF              │ │
│    │ :: 06 FILMS            │    │ :: TAP TO CREATE       │ │
│    └────────────────────────┘    └────────────────────────┘ │
│                                                             │
│               [ (•) TASTE COMPASS : GO WILD ]               │
└─────────────────────────────────────────────────────────────┘
```

### Shelf Block Behavior
- **Canvas State:** Floating square/squircle tiles resting on an ambient OLED dark plane.
- **Micro-Physics:**
  - `whileHover`: Slight expansion + subtle liquid float.
  - `whileTap`: Micro-squish + jiggle rebound.
  - `drag`: Free spatial positioning with organic damping.
- **Tapping a Block:** Smoothly morphs and expands into the full-screen shelf view (`layoutId`).

---

## 3. Inside the Shelf (Single Domain Focus)

- Displays a fluid grid of high-contrast cards (monochrome or raw album/poster art preserved against pure black).
- **Domain-Aware Smart Add Button:** Pinned as a fluid pill at the bottom right (`[+ ADD]`).
- Tapping it opens a liquid bottom drawer already locked to the shelf's domain.

---

## 4. Framer Motion Physics Tokens

```typescript
export const liquidPhysics = {
  // Main elastic transitions
  liquidSpring: {
    type: "spring",
    stiffness: 260,
    damping: 18,
    mass: 1.0,
  },
  // Playful jiggle on touch
  touchJiggle: {
    scale: [1, 0.94, 1.03, 0.98, 1],
    rotate: [0, -1.5, 1.5, -0.5, 0],
    transition: { duration: 0.35, ease: "easeOut" },
  },
  // Floating spatial shelf tile
  floatingBlock: {
    drag: true,
    dragConstraints: { left: -50, right: 50, top: -50, bottom: 50 },
    dragElastic: 0.2,
    whileDrag: { scale: 1.05, cursor: "grabbing" },
  },
};
```
