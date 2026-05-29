# Postcard Platform – Frontend UX/UI & Image Architecture

**Version 1.0 — May 29, 2026**

## Purpose

This document defines the architectural foundation for the frontend, with a strong focus on UX/UI structure and image/visual asset strategy. It is intended to guide future development, component work, and visual improvements so that the product feels cohesive, professional, and scalable.

The goal is to move from reactive fixes to a deliberate, layered architecture that supports both the marketing site and the core product experience (especially the CampaignWizard and TargetingMap).

---

## Core Principles

These principles should drive all frontend and visual decisions:

| Principle | Description | Why It Matters |
|-----------|-------------|----------------|
| **Visual Clarity Over Density** | Prioritize breathing room, clear hierarchy, and intentional spacing | Current landing has both excessive whitespace and visual issues |
| **Controlled Components** | All stateful/interactive components must remain controlled | Prevents bugs and makes behavior predictable |
| **One Design System** | Marketing and product surfaces share tokens and primitives | Avoids two diverging visual languages |
| **Images Are Intentional** | Every image has a defined purpose, treatment, and container strategy | Image handling is currently one of the biggest quality problems |
| **Progressive Disclosure** | Show the right amount of information at each step | Critical for the CampaignWizard experience |
| **Quality Bar Before Polish** | Define what “good” looks like before doing more pixel-level work | Prevents repeated cycles of surface-level fixes |
| **Layered Architecture** | Tokens → Primitives → Composed Components → Pages | Reduces drift and makes changes cheaper and safer |

---

## Design System Architecture

### Layered Model (strict hierarchy)

**Design Tokens (Single source of truth)**

- Color palette, typography scale, spacing scale (4px base), border radius, shadows, motion
- Defined in CSS variables + Tailwind configuration
- Never hardcode raw values in components

**Primitive Components (`components/ui/`)**

- Low-level building blocks: Button, Input, Card, Dialog, Badge, Progress, Tabs, etc.
- Built on shadcn/ui + Radix where appropriate
- Limited, well-defined variants only

**Composed Components**

- Higher-level reusable patterns (e.g. TargetingMap, StatsSidebar, WizardStep, ArtworkPreview, Visual)
- Compose primitives + tokens

**Experience / Page Components**

- Full flows and pages (CampaignWizard, landing sections, Ops views)
- Should primarily use composed components and layout primitives

**Rule:** Most visual and structural changes should happen at the token or primitive level, not by overriding styles deep in page components.

---

## Component Architecture

### Recommended Folder Structure

```
components/
├── ui/                    # Design system primitives
├── targeting/             # TargetingMap + supporting pieces (StatsSidebar, ZipSearch, MapDrawControl, etc.)
├── campaign-wizard/       # Wizard orchestrator, steps, hook, submission logic
├── landing/               # Landing page sections and shared landing components
├── forms/                 # Reusable form patterns and validation helpers
├── layout/                # Navigation, Footer, Section containers, Visual wrapper
├── shared/                # Cross-cutting components (Preview, Status indicators, Visual, etc.)
└── types/                 # Shared TypeScript interfaces (when not co-located)
```

### Component Hierarchy

```
Design Tokens
    │
    ▼
Primitive Components (ui/)
    │
    ├── Button, Card, Input, Dialog, Progress, Badge, Tabs...
    │
    ▼
Composed Components
    ├── TargetingMap (controlled)
    ├── StatsSidebar
    ├── WizardStep (shell + progress + navigation)
    ├── ArtworkPreview
    ├── Visual (components/shared/Visual.tsx)
    └── ZipSearch, MapDrawControl, TargetingFilters
    │
    ▼
Experience Components
    ├── CampaignWizard (orchestrator + state + submission)
    │     ├── BasicsStep
    │     ├── TargetingStep
    │     ├── CreativeStep
    │     └── ReviewStep
    │
    └── Landing Page
          ├── LandingHero
          ├── LandingProblem / Solution
          ├── LandingDemoSection (uses TargetingMap in demoMode)
          └── LandingHowItWorks, LandingSocialProof, etc.
```

---

## Image & Visual Asset Architecture

This is currently one of the weakest and most inconsistent areas.

### Image Treatment Matrix

| Image Type | Purpose | Recommended Treatment | Aspect Ratio Strategy | Container Behavior | Notes |
|------------|---------|----------------------|----------------------|-------------------|-------|
| **Hero** | Emotional / value proposition | `object-cover`, intentional crop | Locked (e.g. 11/6 or 16/9) | Fixed container | High-quality source required |
| **Feature / Explainer** | Solution, how it works | `object-contain` preferred | Flexible or locked | Component-controlled | Avoid distortion |
| **Functional** | Maps, previews, demos | Clean presentation | Component-defined | Component-controlled | Never force marketing ratios |
| **Artwork Preview** | Front/back postcard | Clean background | Maintain original proportions | Component-controlled | Critical for Creative step |
| **Social Proof** | Results / testimonials | Natural photography | Locked aspect | Fixed container | Light or no heavy overlays |

### Image Component Strategy

- Create a single **Visual** component (`components/shared/Visual.tsx`) that accepts a `treatment` and optional `aspectRatio` prop.
- Move away from forcing every image through the same marketing-oriented presets.
- Functional images (TargetingMap, artwork previews, etc.) should control their own presentation.
- Use `next/image` for marketing and functional static assets; use native `<img>` for artwork (blob URLs and dynamic previews).

### Asset Organization

```
public/images/
├── marketing/          # Hero, solution, social proof
├── functional/         # Maps, previews, demos
└── illustrations/      # Diagrams, how-it-works visuals
```

---

## Page & Experience Architecture

### Two Distinct Surfaces

| Surface | Primary Goal | Visual Density | Tone | Key Components | Image Approach |
|---------|--------------|----------------|------|----------------|----------------|
| **Marketing (Landing)** | Conversion + education | Lower | Confident, premium | Hero, sections, demo | High visual impact |
| **Product (Wizard + App)** | Efficiency + clarity | Higher | Calm, professional | Wizard steps, TargetingMap, forms | Functional clarity |

**Guiding Rule:** Both surfaces share the same design system, but default spacing, typography weight, and visual density should differ appropriately.

---

## Key Decisions & Rationale

| Decision | Rationale | Status |
|----------|-----------|--------|
| Use controlled components for TargetingMap and wizard steps | Prevents state bugs and supports reuse across demo and real flows | **Accepted** |
| Separate marketing vs product visual treatment while sharing tokens | Marketing needs emotional impact; product needs clarity and focus | **Accepted** |
| Create a dedicated Visual component for image treatment | Current image handling causes cropping, distortion, and inconsistency | **Accepted** (`components/shared/Visual.tsx`) |
| Strict layered architecture (Tokens → Primitives → Composed) | Reduces visual drift and makes future changes cheaper and safer | **Accepted** |
| Protect the CampaignWizard as the central creation experience | It now contains real submission logic and should evolve deliberately | **Accepted** |
| Define visual quality standards before more polish work | Prevents repeated cycles of surface-level fixes without architectural improvement | **Accepted** |

---

## Integration & Implementation Guidelines

1. Any visual or layout work on the landing page or CampaignWizard must respect the controlled interfaces of TargetingMap and the wizard state model.
2. Image presentation changes should go through the **Visual** component rather than one-off fixes.
3. Before doing significant UI polish, the team should align on a visual quality bar (e.g. maximum section spacing, typography hierarchy, image treatment rules).
4. The current technical progress (Census backend, TargetingMap, CampaignWizard + submit flow) should be preserved. Visual architecture work should layer on top rather than require rewrites.
