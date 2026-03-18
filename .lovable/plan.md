

# Inline Guidance: Remove Toggle, Write Like a Friend

## The Idea

The "What to know" toggle hides critical information behind a click. A person in crisis shouldn't have to discover that they don't need documents — that should be the first thing they read. And the copy should sound like a friend walking you through it, not a system outputting bullet points.

**On AI**: Not yet. The current data model already has `hours`, `eligibility`, `contact`, and `subTags` — enough to generate rich, conversational paragraphs with rule-based string templates. AI becomes worth it when: (a) resources number in the hundreds and can't be hand-curated, (b) you want free-text intake ("I got evicted and my kids are with me"), or (c) you need real-time availability. Right now, hand-crafted templates give you more control over tone and trust. AI can feel like a black box — rule-based feels like a person who memorized the handbook.

## What Changes

### 1. Remove the collapsible "What to know" section entirely

Fold prep points directly into the body text as a natural paragraph that reads like spoken guidance.

### 2. Rewrite `generateStepGuidance` to produce a single `body` string instead of separate `why` + `prepPoints`

The body combines context, hours, eligibility, and preparation into one flowing paragraph. Examples:

**Emergency Shelter Network** (subTag: `tonight`, hours: 24/7):
> "They're open right now — you can call any time, day or night. No documents or ID needed. Families with children are prioritized, so let them know if you have kids with you."

**City Housing Authority** (subTag: `long-term`, hours: Mon-Fri 8-5):
> "They're open Monday through Friday, 8 AM to 5 PM. They'll ask about your income — just an estimate is fine. Bring proof of income if you have it, but call first to see what you need."

**Community Food Bank** (subTag: `right-now`, hours: Tue & Thu 10-2):
> "They're open Tuesdays and Thursdays, 10 AM to 2 PM, and Saturdays 9 to noon. No documents or ID needed — just show up. Open to everyone."

### 3. Simplify `GuidanceStep` component

- Remove `useState`, `showPrep`, the toggle button, and the expandable `<ul>`
- Replace the `why` paragraph + prep toggle with a single `body` paragraph
- Keep: step number, action title, action button, location link, "Learn more" link

### 4. Update the `StepGuidance` interface

```
interface StepGuidance {
  action: string;        // "Call Emergency Shelter Network"
  body: string;          // Full conversational paragraph
  connector: string;     // "If they can't help right now, try this"
  actionType: "call" | "directions" | "email";
  actionValue: string;
}
```

Remove `why` and `prepPoints` — they merge into `body`.

## Implementation

| File | Change |
|---|---|
| `src/data/guidanceCopy.ts` | Replace `generateWhy` + `extractPrepPoints` with a single `generateBody` function that produces conversational paragraphs combining hours, eligibility, and contextual advice |
| `src/components/GuidanceStep.tsx` | Remove toggle state and collapsible section; render `guidance.body` as a single `<p>` |
| `src/components/TriageResults.tsx` | No changes needed — it already passes guidance through |

