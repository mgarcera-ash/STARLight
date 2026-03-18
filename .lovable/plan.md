

# Vertical Scroll Journey — Replacing Toggle Overload

## The Problem

Right now, a single GuidanceStep has **3 expandable toggles** ("Tell me more", "Not sure what to say?", "I've tried this before"), **2 action tiles**, a skip button, and a help link. That's 7 interactive decisions on a 393px screen. For someone in crisis, each toggle is a tiny cognitive tax — "should I tap this? what's behind it?" The progressive disclosure pattern that was meant to reduce overwhelm has become its own source of it.

## The Shift

Replace the click-to-reveal model with a **scroll-to-discover** vertical journey. Everything lives on one scrollable page per step, staggered in with `whileInView` animations. The user just scrolls. No decisions about what to open. The page tells a story top to bottom:

```text
┌─────────────────────┐
│   "Here's your      │  ← headline, fades in
│    first step."     │
│                     │
│  Call Project HOME. │  ← lead text
│  They're open 24/7. │
│                     │
│  No ID needed.      │  ← detail (no toggle, just smaller text)
│  Just reach out.    │
│                     │
│  ┌──────┐ ┌──────┐  │  ← action tiles
│  │ Call │ │ Map  │  │
│  └──────┘ └──────┘  │
│                     │
│  ┌─────────────────┐│  ← call script card (always visible)
│  │ When they pick  ││
│  │ up, say: "Hi, I ││
│  │ need a bed..."  ││
│  └─────────────────┘│
│                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ │  ← subtle divider
│                     │
│  Tried this before? │  ← tips (always visible, muted)
│  • Call at 8am...   │
│  • Ask for intake.. │
│                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│                     │
│  Need help? Talk    │  ← peer navigator link
│  to someone.        │
│                     │
│  This doesn't work  │  ← skip link
│  for me             │
│                     │
│  ┌─────────────────┐│  ← sticky or inline
│  │   Next step →   ││
│  └─────────────────┘│
└─────────────────────┘
```

Each section staggers in as the user scrolls to it using framer-motion's `whileInView`. No clicks required to see anything. The scroll itself is the interaction.

## Changes

### `src/components/GuidanceStep.tsx`
- Remove all `useState` toggles (`showDetail`, `showScript`, `showTips`)
- Change layout from `flex items-center justify-center` (vertically centered) to `flex flex-col pt-4 pb-24 overflow-y-auto`
- Render all sections inline, top-to-bottom, always visible
- Wrap each section in `<motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, margin: "-50px" }}>` for scroll-triggered stagger
- Detail text renders directly below lead (smaller, muted) — no "Tell me more" button
- Call script card always visible below tiles — no "Not sure what to say?" button
- Tips section always visible below script — no "I've tried this before" button
- "Need help?" and "This doesn't work for me" sit at the bottom, above "Next step"

### `src/components/TriageResults.tsx`
- Change the step container from `flex-1 flex flex-col` (which vertically centers GuidanceStep) to allow natural scrolling
- "Next step" button moves inside GuidanceStep's scroll flow (at the bottom) or becomes a sticky footer — either works, but inline at scroll bottom feels more like a journey endpoint

### No changes to
- `guidanceCopy.ts` — the data structure is fine, we just stop hiding it
- `seed.ts`, `types`, triage flow, follow-up flow — all unchanged

## What This Preserves
- The companion voice, tone, and copy
- Max 2 action tiles, smart tile logic, transit directions
- Call scripts, tips, peer navigator link, skip tracking
- The paginated step model (still one resource per step with horizontal transitions)

## What This Removes
- 3 toggle buttons and their associated state
- The cognitive tax of "should I tap this?"
- The vertically-centered layout that squeezed everything into viewport height

