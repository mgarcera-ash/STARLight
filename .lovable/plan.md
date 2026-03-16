

# STARLight MVP — Build Plan

## Branding

Colors extracted from your brand guide:

| Role | Hex | HSL (approx) |
|------|-----|---------------|
| Primary (teal) | #05cda3 | 166 95% 41% |
| Dark navy | #011f5b | 222 97% 18% |
| Purple | #342987 | 250 55% 34% |
| Blue accent | #008591 | 185 100% 28% |
| Purple accent | #763e96 | 280 42% 42% |
| Gold accent | #dc8616 | 34 85% 47% |
| Signature gradient | teal → blue accent | — |

## Architecture Overview

```text
src/
├── data/
│   └── seed.ts                 # All seed resources, categories, tags
├── types/
│   └── index.ts                # Resource, Category, Tag, Submission types
├── pages/
│   ├── Index.tsx               # Splash → Browse (main entry via NFC)
│   ├── ResourceDetail.tsx      # Structured resource page
│   ├── Search.tsx              # Search results
│   ├── SubmitResource.tsx      # Flyer builder / submission form
│   └── ReviewQueue.tsx         # Admin approval queue
├── components/
│   ├── SplashIntro.tsx         # Animated intro overlay (fade/glow)
│   ├── BrowseHome.tsx          # Featured + category carousels
│   ├── ResourceCard.tsx        # Card used in carousels/grids
│   ├── CategoryRow.tsx         # Horizontal scroll row per category
│   ├── SearchBar.tsx           # Sticky search input
│   ├── ResourceInfo.tsx        # Detail page content sections
│   ├── ShareActions.tsx        # Share via link/SMS/print buttons
│   ├── SubmissionForm.tsx      # Form fields for new resource
│   ├── ReviewCard.tsx          # Pending submission card for reviewers
│   └── BottomNav.tsx           # Mobile bottom navigation
```

## What Gets Built

### 1. Theme & Layout
- Replace default shadcn CSS variables with STARLight brand colors (teal primary, navy foreground, purple secondary, gold accent).
- Add the signature teal→blue gradient as a utility class.
- Mobile-first layout with sticky bottom nav (Browse, Search, Submit, Review).

### 2. Splash Intro Animation
- Full-screen overlay on first load: dark navy background, STARLight wordmark fades in with a soft glow, then slides up to reveal the browse interface. ~2s total, CSS animations only. Shown once per session (sessionStorage flag).

### 3. Seed Data (~20 resources)
- Typed resource objects with: id, title, description, category tags, eligibility, hours, contact info, location, image placeholder, featured flag.
- Categories: Housing, Food, Healthcare, Legal, Community, Internal Programs.

### 4. Browse Home (Index page)
- Featured carousel at top (horizontal scroll, large cards).
- Category rows below, each a horizontal carousel of smaller cards.
- Sticky search bar at top.

### 5. Resource Detail Page
- Structured sections: description, eligibility, hours, contact, location, tags.
- Share actions: copy link, share via native Web Share API, "Print flyer" button (window.print with print-optimized CSS).

### 6. Search
- Client-side fuzzy search across title, description, tags.
- Results displayed as card grid.

### 7. Flyer Builder (Submit Resource)
- Multi-field form: title, description, category tags (multi-select), eligibility, hours, contact, location, optional flyer upload.
- On submit → adds to a pending queue in local state.
- Auto-generates a preview of the structured page.

### 8. Review Queue
- Lists pending submissions as cards.
- Approve (moves to live library) or Return with comments.
- All state managed in React context (no backend per scope).

### 9. State Management
- React Context for the resource library + pending queue.
- All mutations are in-memory with seed data as starting point.

## Implementation Order
1. Types, seed data, context provider
2. Theme/colors, layout, bottom nav
3. Splash intro animation
4. Browse home with carousels
5. Resource detail page + share actions
6. Search
7. Submit form (flyer builder)
8. Review queue

