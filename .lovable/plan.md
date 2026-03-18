

# From Resource Catalog to Personal Guide

## The Problem (Both Hats)

**As the user**: The results page hits you with a wall of cards — gradients, icons, Call/Directions/Email buttons, expandable sections. It looks like an app store. You were just asked something vulnerable, heard a warm message, and now you're dumped into a UI that requires you to evaluate, compare, and choose. That's a caseworker's job, not yours. You don't know which one to call first, what to say when they answer, or what happens if they say no. So you close the app.

**As the developer**: The current design treats resources as equal options in a marketplace. But social services don't work that way. There's a sequence. You call the most relevant one first. If they're closed or full, you try the next. You need certain documents. Some places have waitlists. A good caseworker doesn't hand you a pamphlet rack — they hand you a plan.

## The Insight: Without AI, We Already Have Enough Data

Every resource already has: `urgency`, `subTags`, `eligibility`, `hours`, `contact.phone`. That's enough to generate a step-by-step guided plan. We don't need AI to say "Call this number first. They're open right now. If they can't help, here's your backup." We just need to restructure how we present what we already know.

**Should we look into AI?** Not yet. AI would help with conversational triage ("tell me more about your situation"), but the guided results page is a data-presentation problem, not a reasoning problem. The resources are finite and well-structured. A rule-based system with good copy does the job. AI becomes valuable later when: (a) the resource database grows beyond hand-curated, (b) you want natural language intake, or (c) you need real-time availability checking. For now, hand-crafted guidance > black-box recommendations for trust.

## The Solution: Replace Card Grid with a Step-by-Step Action Plan

Instead of showing cards, show numbered steps with plain-language instructions. One resource per step. The primary action (call/go) is the only button visible. Details are tucked behind "What to know" expandable.

```text
┌─────────────────────────────┐
│                             │
│  Here's your plan.          │
│  Go through these steps     │
│  one at a time.             │
│                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│  Step 1                     │
│  Call Emergency Shelter     │
│  Network                    │
│  They're open 24/7 and can  │
│  help you find a bed        │
│  tonight.                   │
│                             │
│  ┌───────────────────────┐  │
│  │  📞 Call (215) 555-0107│  │
│  └───────────────────────┘  │
│                             │
│  ▸ What to know before      │
│    you call                 │
│    · No documents needed    │
│    · Families with children │
│      are prioritized        │
│                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│  Step 2                     │
│  If they can't help, try    │
│  City Housing Authority     │
│  ...                        │
│                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│  Didn't work out?           │
│  ┌───────────────────────┐  │
│  │  See all options       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### What Changes

1. **Step-by-step layout**: Top 2-3 best matches shown as numbered steps, not cards. Each step has a warm instruction line ("Call X — they're open right now"), one big action button, and a collapsible "What to know" section with eligibility/hours.

2. **Connector language between steps**: "If they can't help" / "While you wait for that" / "You might also need" — not "Also a good fit." This guides the user through a sequence rather than presenting a menu.

3. **"What to know before you call"**: Pulls from `eligibility` and `hours` fields. Presented as simple bullet points. This replaces the current card's expandable "More info" section with actionable prep.

4. **Remaining resources as a "See all options" fallback**: The "other matches" collapse into a simple list at the bottom, accessible but not overwhelming. Only shown if the guided steps don't cover everything.

5. **Context-aware step copy**: Use the `subTags` and resource data to generate connecting phrases. E.g., if subTag is `tonight` and resource hours include "24/7", the step says "They're open right now." If hours are "Mon-Fri 9-5", it says "They open at 9 AM tomorrow."

### Data Layer: Step Copy Generation

New file `src/data/guidanceCopy.ts` with a function `generateStepGuidance(resource, subTags, stepIndex)` that returns:
- `instruction`: "Call Emergency Shelter Network" 
- `why`: "They're open 24/7 and can help you find a bed tonight."
- `connector`: (for step 2+) "If they can't help tonight" / "While you're waiting" / "You might also need"
- `prepPoints`: Extracted from eligibility — e.g., "No documents needed", "Must bring proof of income"

This is all rule-based string generation from existing resource fields. No AI needed.

## Implementation

| File | Change |
|---|---|
| `src/data/guidanceCopy.ts` | **New** — rule-based step copy generator using resource fields + subTags |
| `src/components/TriageResults.tsx` | **Rewrite** — replace card grid with numbered step-by-step action plan |
| `src/components/GuidanceStep.tsx` | **New** — single step component with action button + collapsible prep info |
| `src/components/ResourceCard.tsx` | No changes (still used in fallback "See all options" section) |

