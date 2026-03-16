

# Deep Triage: Follow-Up Assessment Steps

## The Problem

Right now the flow is: pick a category → see all matching resources. But "I need housing" could mean wildly different things — tonight's emergency shelter vs. long-term affordable housing vs. accessibility-adapted housing. The system should ask the right follow-up questions to narrow results down to what actually fits.

## The Concept

After the user selects their needs on the triage screen, a **step-by-step follow-up questionnaire** appears — one question at a time, large tap targets, plain language. Each category triggers its own contextual questions. The answers filter and re-rank results before showing them.

```text
Triage Screen → Follow-Up Questions (1-2 per category) → Filtered Results
     "Food"    → "How soon do you need food?"
                  [ Right now ]  [ This week ]  [ Ongoing help ]
```

## Follow-Up Questions by Category

| Category | Question | Options |
|---|---|---|
| Housing | How urgent is your need? | "I need somewhere tonight" / "Within a few days" / "I'm looking for longer-term help" |
| Housing | Any accessibility needs? | "Ground floor / no stairs" / "Wheelchair accessible" / "No special needs" |
| Food | How soon do you need food? | "Right now — I'm hungry" / "This week" / "Ongoing assistance" |
| Healthcare | What kind of care? | "I'm in crisis right now" / "I need to see a doctor" / "Mental health support" / "Substance use help" |
| Legal | What's the situation? | "Housing / eviction issue" / "Immigration" / "Family or domestic matter" / "Something else" |
| Community | What would help most? | "Activities for my kids" / "Job or training help" / "Someone to talk to" / "Clothing or supplies" |
| Internal Programs | (No follow-up — too few resources to subdivide) |

## Data Model Changes

Add a `subTags` field to each resource in the seed data — lightweight string array that the follow-up answers map to. For example, Emergency Shelter Network gets `["tonight", "ground-floor"]`. Community Food Bank gets `["right-now", "ongoing"]`. This keeps filtering simple: answers map to sub-tags, resources with matching sub-tags rank higher.

```typescript
// types/index.ts — add to Resource
subTags: string[];

// New type for follow-up flow
interface FollowUpQuestion {
  id: string;
  category: Category;
  question: string;
  options: { label: string; subTag: string }[];
}
```

## UI: One Question Per Screen

Each follow-up is a full-screen step with:
- A progress indicator (dots or a simple "1 of 2")
- The question in large, friendly text
- 2-4 large tappable option cards (same style as triage cards)
- A "Skip" link at the bottom for users who don't want to answer
- Smooth slide transition between steps

Only questions for the user's selected categories are shown. If they picked Food and Housing, they get ~3-4 questions total. If they picked Internal Programs only, they skip straight to results.

## Filtering Logic

In `TriageResults`, the follow-up answers boost matching resources to the top. Resources that match the sub-tags appear first (still sorted by urgency within that group). Resources that match the category but not the sub-tags appear below under a "Other options" divider. Nothing is hidden — just reordered.

## Implementation Files

| File | Change |
|---|---|
| `src/types/index.ts` | Add `subTags: string[]` to Resource, add `FollowUpQuestion` type |
| `src/data/seed.ts` | Add `subTags` to all 20 resources |
| `src/data/followUpQuestions.ts` | New — all follow-up question definitions |
| `src/components/FollowUpFlow.tsx` | New — paginated question UI with progress dots |
| `src/pages/Index.tsx` | Add follow-up state between triage selection and results |
| `src/components/TriageResults.tsx` | Accept follow-up answers, boost matching sub-tags to top |

## Flow in Index.tsx

```text
State machine:
  splash → triage → followUp → results
                        ↑
              Only if selected categories have questions
```

The Index component gains a `followUpAnswers: Record<string, string>` state. After triage submission, it checks if any selected categories have follow-up questions. If yes, it renders `FollowUpFlow`. When complete, it passes both `needs` and `answers` to `TriageResults`.

