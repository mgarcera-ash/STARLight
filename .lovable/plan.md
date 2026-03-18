

# Vertical Snap Pagination with Free-Scroll Unlock

## The Thinking

**Vulnerable user perspective**: Right now, even though toggles are gone, content still loads as a continuous feed. The eye has to decide where to stop. A snap-paginated flow removes that decision — each section *is* a stopping point. The screen holds you gently on one idea at a time. "Here's who to call." Breathe. Scroll. "Here's what to say." Breathe. Scroll. It turns information delivery into a conversation pace.

**Developer/social services perspective**: Scroll-hijacking is usually hostile UX. But this population isn't power-browsing — they're processing one scary thing at a time. The key trade-off: snap pagination *during first reveal* (forces absorption), then **unlock free scroll** once they've seen everything (turns it into a reference they can skim back through). This mirrors how a case worker walks someone through steps verbally, then hands them a sheet to keep.

## How It Works

Each GuidanceStep becomes a series of **snap sections** inside a scroll-snap container. Each section occupies the full viewport height and centers its content. The container uses `scroll-snap-type: y mandatory`.

When the user scrolls past the final section (the "Next step" / navigation area), an `IntersectionObserver` fires and switches the container to `scroll-snap-type: y proximity` (or removes it), unlocking free scrolling so the user can freely move up and down to review.

```text
Section 1 (snap)     Section 2 (snap)     Section 3 (snap)     Section 4 (snap)
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │      │             │
│  "Here's    │      │ ┌────┐┌────┐│      │ ┌──────────┐│      │  Tried this │
│   your      │      │ │Call││Map ││      │ │ "Say: Hi │││      │  before?    │
│   first     │  ↓   │ └────┘└────┘│  ↓   │ │ I need a ││  ↓   │  • tip 1    │
│   step."    │      │             │      │ │ bed..."  ││      │  • tip 2    │
│             │      │             │      │ └──────────┘│      │             │
│  Call them. │      │             │      │             │      │  [Next →]   │
│  They're    │      │             │      │  They'll    │      │  [Skip]     │
│  open 24/7. │      │             │      │  take it    │      │  [Help]     │
│             │      │             │      │  from there │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                                                                     ↓
                                                          snap releases → free scroll
```

A subtle **scroll indicator** (small dots or a thin progress line) shows which section you're on, and fades out once free-scroll unlocks.

## Sections per step

Not every step has all sections. Build dynamically:

1. **Intro** (always): headline + lead + detail
2. **Actions** (if tiles exist): the 1-2 action squircles, centered
3. **Call script** (if resource has phone): the "when they pick up" card
4. **Tips + Navigation** (always): tips (if any), peer navigator link, skip, next button

So 3-4 sections depending on resource. Each section is `min-h-[100dvh]` with content centered via flexbox.

## Implementation

### `src/components/GuidanceStep.tsx`
- Add `useState` for `unlocked` (boolean, starts false)
- Wrap all content in a scroll-snap container: `overflow-y-auto scroll-snap-type-y-mandatory` (via inline style since Tailwind doesn't have scroll-snap utilities by default)
- Group content into snap sections, each `min-h-[100dvh] flex items-center justify-center snap-start`
- Use a `ref` + `IntersectionObserver` on the last section; when it enters view, set `unlocked = true` which changes container style to `scroll-snap-type: none`
- Each section still uses `whileInView` framer-motion animations for the fade-up reveal
- Add a small dot indicator (3-4 dots) fixed at the bottom of the container, highlighting current section via another IntersectionObserver, fading out when `unlocked`

### `src/components/TriageResults.tsx`
- Ensure the step container gives GuidanceStep full viewport height (`h-screen` or `h-dvh`) so snap sections work correctly
- The back button and step transitions remain unchanged

### `src/index.css`
- Add utility classes for scroll-snap since Tailwind doesn't include them by default:
  - `.snap-y-mandatory { scroll-snap-type: y mandatory; }`
  - `.snap-start { scroll-snap-align: start; }`
  - `.snap-none { scroll-snap-type: none; }`

### No changes to
- `guidanceCopy.ts`, `seed.ts`, `types` — data layer unchanged
- Triage, follow-up, transition flows — unchanged

