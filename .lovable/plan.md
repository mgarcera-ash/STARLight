

# Option B: Tap-to-Continue Progressive Reveal

## Concept
Replace scroll-based reveal with tap/click. The container is **not scrollable** until all sections are revealed. Each tap anywhere (or on a pulsing prompt) increments `revealedCount`. Framer Motion `layout` animations smoothly shift the intro text upward as new sections fade in below. Once all revealed, scrolling unlocks.

## Changes

### `src/components/GuidanceStep.tsx`
- **Remove** scroll sentinel, `IntersectionObserver`, `sentinelRef`, `containerRef` scroll logic
- **Container**: `overflow-hidden` until `unlocked`, then `overflow-y-auto`. Add `onClick` handler that increments `revealedCount` when not yet unlocked
- **Intro section**: Use `motion.div` with `layout` prop. Starts with `min-h-[100dvh]` centered, but as `revealedCount` grows, switches to `min-h-auto` with compact padding — Framer Motion animates the position change smoothly
- **All sections**: Wrap in `AnimatePresence`. Each section renders conditionally based on `revealedCount > sectionIndex`, fades in with `opacity` + `y` animation. Use `layout` on the wrapper so siblings animate smoothly
- **Replace `ScrollHint`** (chevron) with a "Tap to continue" text that pulses, positioned at the bottom. Hidden once unlocked
- **Keep `DotIndicator`** — tracks progress, fades when unlocked
- **Reset** `revealedCount` to 1 on `resource.id` change

### Key behavior
```
State 0:                    Tap:                        Tap again:
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│             │             │  "Here's    │             │  "Here's    │
│  "Here's    │             │   your      │             │   your      │
│   your      │  layout     │   first     │  layout     │   first     │
│   first     │  animates   │   step."    │  animates   │   step."    │
│   step."    │  ───────►   │             │  ───────►   │ ┌────┐┌────┐│
│             │             │ ┌────┐┌────┐│             │ │Call││Map ││
│             │             │ │Call││Map ││             │ └────┘└────┘│
│  tap to     │             │ └────┘└────┘│             │ ┌──────────┐│
│  continue   │             │  tap to     │             │ │ "Say: Hi"││
└─────────────┘             │  continue   │             │ └──────────┘│
                            └─────────────┘             │  [scrollable]
                                                        └─────────────┘
```

### No changes to
- `TriageResults.tsx`, `src/index.css`, data files, types

