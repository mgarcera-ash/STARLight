

# Paginated Guide: One Step Per Page

## The Problem

Right now, all 3 guided steps appear on a single scrollable page. Even with staggered animations, it's still a wall of information. The user has to scroll, scan, and decide. That's cognitive load we can eliminate.

The follow-up flow and empathy bridge already established a rhythm: one thing at a time, centered, breathing room. The plan should continue that rhythm.

## The Design

Each guided step becomes its own full-screen page. The user sees one action at a time. After acting (or choosing to skip), they advance to the next step. Same `AnimatePresence` slide pattern as `FollowUpFlow`.

```text
Page 1:                        Page 2:
┌─────────────────────┐        ┌─────────────────────┐
│ ← Back    1 of 3    │        │ ← Back    2 of 3    │
│ ━━━━━━━━━━━━━━━━━━━ │        │ ━━━━━━━━━━━━━━━━━━━ │
│                     │        │                     │
│ Step 1              │        │ If they can't help,  │
│                     │        │ try this next.       │
│ Call Emergency      │        │                     │
│ Shelter Network     │        │ Step 2              │
│                     │        │                     │
│ They're open right  │        │ Go to City Housing  │
│ now. You can call   │        │ Authority           │
│ any time...         │        │ ...                 │
│                     │        │                     │
│ ┌─────────────────┐ │        │ ┌─────────────────┐ │
│ │ 📞 Call number  │ │        │ │ 🧭 Directions   │ │
│ └─────────────────┘ │        │ └─────────────────┘ │
│                     │        │                     │
│ 📍 123 Main St     │        │                     │
│ Learn more →        │        │                     │
│                     │        │                     │
│   Next step →       │        │   Next step →       │
│                     │        │                     │
└─────────────────────┘        └─────────────────────┘

Final page (after last step):
┌─────────────────────┐
│                     │
│ That's your plan.   │
│ You can come back   │
│ any time.           │
│                     │
│ [See all options]   │
│ [Start over]        │
│                     │
└─────────────────────┘
```

## Implementation

### `src/components/TriageResults.tsx`

- Add `currentStep` state (0-indexed), starting at 0
- Use `AnimatePresence mode="wait"` with horizontal slide transitions (same as `FollowUpFlow`)
- Add progress bar + "Back" / step counter at top (same pattern as `FollowUpFlow`)
- Each page renders one `GuidanceStep` centered on screen
- Add "Next step" button at bottom of each page to advance
- "Back" goes to previous step (or triggers confirm if on step 0)
- After the last guided step, show a closing page with empathetic summary + "See all options" fallback + "Start over"
- The confirmation flow for "Start over" remains unchanged
- Remove the old scrollable layout and staggered delays

### `src/components/GuidanceStep.tsx`

- Remove the `delay` prop and entry animation (the parent `AnimatePresence` handles transitions now)
- Keep everything else: connector text, step number, action button, location, "Learn more" link

### No changes needed to `guidanceCopy.ts` or `Index.tsx`

