

# Interactive, Action-First Resource Cards

## Problem
After triage, users land on results that are still passive information cards — badges, truncated descriptions, tags, and a detail page full of text. The user has to read, interpret, and figure out what to do. For someone in crisis, the system should tell them what to do and let them do it in one tap.

## Philosophy
Every card becomes an **action hub**, not an information dump. The system says: "Here's where to go. Tap to call. Tap to navigate. Tap to email." No tags. No jargon. No reading required.

## Changes

### 1. Redesign ResourceCard as an Action Card
Remove: category badges, description text, tags.
Keep: title, category icon/gradient header.
Add: **action buttons directly on the card**:
- **Call** button (green, prominent) — `tel:` link, only shown if phone exists
- **Directions** button — opens Google Maps with the address
- **Email** button — `mailto:` link, only if email exists
- Expandable "More info" accordion for description/eligibility/hours (collapsed by default = progressive disclosure)

```text
┌────────────────────────────┐
│  [🏠 gradient zone]        │
│                            │
│  City Housing Authority    │
│  📍 1234 Broad St          │
│                            │
│  [📞 Call]  [🗺 Map]  [✉ Email] │
│                            │
│  ▶ More info               │
└────────────────────────────┘
```

### 2. Embed a Live Map on the Detail Page
Replace the static location text with an embedded Google Maps iframe using the resource address. Free, no API key needed for embed mode (`maps.google.com/maps?q=ADDRESS&output=embed`).

### 3. Redesign ResourceDetail as Action-First
Reorder the detail page:
1. Hero with title + category
2. **Big action buttons** — Call Now (full-width green), Get Directions (full-width), Email (full-width)
3. Embedded map
4. Collapsible sections for Hours, Eligibility, Description
5. Share actions at bottom

Remove the tags section entirely.

### 4. Simplify TriageResults
- Remove filter chips (user doesn't need to see internal category names)
- Change header copy to be warmer: "Here's what we recommend" instead of "We found X resources"
- Keep the "Start here" priority card pattern

### 5. Remove Tags from Data Model Display
Tags remain in the data (useful for search), but are never rendered in any user-facing card or detail view.

## Files

| File | Change |
|---|---|
| `src/components/ResourceCard.tsx` | Replace badges/description with action buttons + expandable info |
| `src/components/TriageResults.tsx` | Remove filter chips, warmer copy |
| `src/pages/ResourceDetail.tsx` | Action-first layout, embedded map |
| `src/components/ResourceInfo.tsx` | Rewrite as collapsible sections, remove tags, add action buttons |
| `src/components/ShareActions.tsx` | Keep but move to bottom of detail page |

