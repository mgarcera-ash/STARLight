

# Growing Page with Progressive Reveal

## Concept

The page starts with just the headline centered on screen. Nothing else exists. As the user scrolls, the page literally "grows" — each new component fades in below the previous content, pushing the page taller. The headline shifts upward naturally as content accumulates beneath it. Once everything is revealed, free scroll.

This is NOT scroll-snap between full-viewport sections. It's a single page that starts small and expands.

```text
State 0 (initial):          State 1 (scrolled):         State 2 (scrolled more):
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│             │             │  "Here's    │             │  "Here's    │
│             │             │   your      │             │   your      │
│  "Here's    │             │   first     │             │   first     │
│   your      │             │   step."    │             │   step."    │
│   first     │             │             │             │             │
│   step."    │    scroll   │ ┌────┐┌────┐│   scroll    │ ┌────┐┌────┐│
│             │   ───────►  │ │Call││Map ││  ───────►   │ │Call││Map ││
│             │             │ └────┘└────┘│             │ └────┘└────┘│
│             │             │             │             │             │
│             │             │      ↓      │             │ ┌──────────┐│
│      ↓      │             └─────────────┘             │ │ "Say: Hi"││
└─────────────┘                                         │ └──────────┘│
                                                        │      ↓      │
                                                        └─────────────┘
```

## Mechanism

Replace CSS scroll-snap with JS-controlled progressive disclosure:

- **`revealedCount`** state starts at 1 (only intro visible)
- The intro section takes `min-h-[100dvh]` with content centered — this is the "blank page with centered text" starting state
- A **scroll sentinel** (invisible div) sits at the bottom of the currently revealed content. An `IntersectionObserver` watches it. When the user scrolls to it, `revealedCount` increments, adding the next section
- Subsequent sections (actions, script, tips) use **normal compact padding** (`py-6 px-8`) — no viewport-height sections. They fade in with a motion animation
- The sentinel repositions to the bottom of the newly added content, ready for the next scroll
- Once all sections are revealed (`revealedCount >= total`), set `unlocked = true`, remove sentinel, dots fade out
- The scroll hint chevron stays visible until unlocked

## Changes

### `src/components/GuidanceStep.tsx`
- Remove CSS `scrollSnapType` from container — no more snap behavior
- Replace `seenSections` set with a single `revealedCount` integer
- First section (`intro`): keep `min-h-[100dvh] flex items-center justify-center` so text starts centered
- All other sections: render only when `revealedCount > sectionIndex`, use compact `py-4 px-8` with fade-in animation
- Add a sentinel `div` after the last revealed section, observed by `IntersectionObserver` to trigger next reveal
- Add bottom padding (`pb-[60dvh]`) to non-final sections so user has room to scroll to trigger the sentinel
- Keep `DotIndicator` and `ScrollHint` — they still track progress and fade when unlocked
- Reset `revealedCount` to 1 when `resource.id` changes

### `src/index.css`
- Remove `.snap-section` class (no longer needed)

### No changes to
- `TriageResults.tsx`, data files, types

