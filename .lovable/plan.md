

# Action Tiles + Softer Transitions + "I've tried this" Escape Hatch

## Three Changes

### 1. Two squircle tiles instead of inline links

Replace the phone number and address text links with two side-by-side rounded-2xl tiles. Same quiet tone, but more tappable and visually balanced. No borders, just a soft muted background.

```text
┌──────────────────────────────┐
│                              │
│   Here's your first step.    │
│                              │
│   Call Emergency Shelter     │
│   Network. They're open      │
│   right now...               │
│                              │
│  ┌────────────┐ ┌──────────┐ │
│  │ 📞         │ │ 📍       │ │
│  │ Call        │ │ Get      │ │
│  │ (215)…0107 │ │ directions│ │
│  └────────────┘ └──────────┘ │
│                              │
│      Next step →             │
└──────────────────────────────┘
```

Each tile: `bg-muted/50 rounded-2xl p-4`, icon + short label + value. Tappable. No border, no shadow. Feels like a suggestion, not a command.

### 2. Softer transitions

Current slide is `x: 60` with `duration: 0.3`. That's snappy. Slow it down and reduce the distance:
- `x: direction * 30` (less dramatic movement)
- `duration: 0.45, ease: [0.25, 0.1, 0.25, 1]` (gentler cubic bezier)
- Add a slight `opacity` fade overlap feel

### 3. "I've tried this before" — contextual nudge

Add a small text link below the action tiles: "I've called here before." Tapping it reveals a gentle expanded section (not a modal, not a new page) with nuanced context pulled from the resource data:
- Specific department or person to ask for (new optional field: `tips` on Resource)
- Hours nuance ("Try calling right when they open at 8 AM. That's when the intake coordinator is available.")
- What to say ("Ask specifically for emergency intake, not general housing.")

For now, since we don't have a `tips` field yet, we can:
- Add an optional `tips: string[]` field to the `Resource` type
- Add sample tips to a few seed resources
- Generate a fallback tip from existing data (e.g., "Try calling right when they open" based on hours, "Ask about [eligibility context]" based on eligibility)

The reveal uses a gentle expand animation (no slide, just height + fade), and the tone stays conversational: "Here's what might help if you've tried before."

## Implementation

| File | Change |
|---|---|
| `src/types/index.ts` | Add optional `tips: string[]` to `Resource` |
| `src/data/seed.ts` | Add sample `tips` to 3-4 resources |
| `src/data/guidanceCopy.ts` | Add `generateFallbackTips` function that creates tips from hours/eligibility when `tips` is empty |
| `src/components/GuidanceStep.tsx` | Replace inline links with two squircle tiles side by side. Add "I've called here before" expandable section below. |
| `src/components/TriageResults.tsx` | Soften transition parameters (less distance, slower easing) |

