

# Visual Hours Component

## Problem
The guidance copy currently embeds raw hours strings like "Mon–Fri 8:00 AM – 5:00 PM" inline in paragraph text. It reads like a data dump, not like a friend talking to you.

## Approach
Create a compact **HoursIndicator** component that replaces the inline hours text with a visual, glanceable element. Two parts:

### 1. New component: `src/components/HoursIndicator.tsx`

A small visual widget that shows:
- **Open/Closed status pill** — green dot + "Open now" or red dot + "Opens Mon 8 AM" based on current time/day
- **Weekly bar** — 7 tiny day circles (M T W T F S S), filled/highlighted for days the resource is open, muted for closed days. Current day gets a ring
- For 24/7 resources: just shows a green pill "Open 24/7" with no day bar needed

Parses the `hours` string (e.g. "Mon–Fri 8:00 AM – 5:00 PM") into structured day/time data using simple regex patterns that match the seed data formats.

```text
┌─────────────────────────┐
│ 🟢 Open now · closes 5 PM│
│ M  T  W  T  F  S  S     │
│ ●  ●  ●  ●  ●  ○  ○     │
└─────────────────────────┘
```

### 2. Update `src/data/guidanceCopy.ts`

- Remove the hours string from `lead` text entirely. Replace "Their hours are Mon–Fri..." with simpler contextual phrases:
  - Non-urgent: "Here's when they're available." (the component shows the rest)
  - Tonight/urgent + closed: "They might be closed right now — check below."
  - 24/7 and crisis lines keep their current warm phrasing (no change needed)

### 3. Update `src/components/GuidanceStep.tsx`

- Import and render `<HoursIndicator hours={resource.hours} />` inside the intro section, below the lead text, with its own stagger delay
- Sits between the lead paragraph and the action tiles

### Parsing strategy
The seed data uses consistent formats:
- `"Mon–Fri 8:00 AM – 5:00 PM"` → M-F filled
- `"Tue & Thu 10:00 AM – 2:00 PM, Sat 9:00 AM – 12:00 PM"` → T, Th, S filled  
- `"Mon–Sun 7:00 AM – 9:00 PM"` → all filled
- `"24/7 Intake Line"` / `"24/7 Hotline"` → special 24/7 pill

A helper function maps day names/ranges to a `boolean[7]` array and extracts open/close times for the "Open now" calculation.

## No changes to
- Types, seed data, TriageResults, or other components

