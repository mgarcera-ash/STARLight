

# Visual Upgrade Plan

## Problems Identified
1. **Cards are text-only** — no imagery, just category badges + text + location
2. **Low contrast** — light card on near-white background, muted text blends in
3. **Cards not rounded enough** — currently `rounded-xl` (12px), needs more
4. **Browse page is monotonous** — every section looks the same (text rows)
5. **Detail page is plain** — no hero visual, just gradient bar + text sections

## Changes

### 1. Add Category Icons & Illustrations to Cards
Each category gets a large decorative icon/emoji or gradient illustration area at the top of the card. This replaces the "wall of text" feel with a visual anchor.

```text
┌──────────────────────┐
│  ┌──────────────┐    │
│  │  🏠 gradient  │    │  ← colored illustration zone
│  │   backdrop    │    │     per category
│  └──────────────┘    │
│  [Housing]           │
│  City Housing Auth   │
│  📍 1234 Broad St    │
└──────────────────────┘
```

- Each category maps to: a large Lucide icon + a category-specific gradient background fill at the top of the card
- Featured cards get a subtle animated shimmer border

### 2. Increase Card Roundness & Depth
- Cards go from `rounded-xl` → `rounded-2xl` (16px)
- Add stronger shadow: `shadow-md` default, `shadow-lg` on hover
- Add a subtle left-side color accent bar per category

### 3. Boost Contrast
- Darken `--muted-foreground` from 42% lightness → 35%
- Make card borders slightly more visible: `--border` from 90% → 86%
- Category badge text gets bolder contrast
- Section headings on detail page use `font-bold` instead of `font-semibold`

### 4. Visual Detail Page Hero
- Resource detail page gets a large colored hero area with a big category icon centered, replacing the plain gradient strip
- Eligibility section gets an icon-enhanced card style with colored left border

### 5. Browse Page Visual Variety
- Featured carousel cards get a gradient background overlay instead of plain white
- Add a "Quick Access" icon grid below the search bar — 6 category circles with icons (like app shortcuts) for fast filtering
- Section headers get category-colored left accent bars

### Files Modified
- `src/components/ResourceCard.tsx` — add icon header zone, rounder corners, accent bar
- `src/components/BrowseHome.tsx` — add category icon grid
- `src/components/FeaturedCarousel.tsx` — gradient overlay on featured cards
- `src/components/ResourceInfo.tsx` — bolder headings, colored accent sections
- `src/pages/ResourceDetail.tsx` — large hero with category icon
- `src/index.css` — contrast tweaks, shimmer animation
- `src/components/CategoryRow.tsx` — colored section header accent

