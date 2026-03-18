

# From Card UI to Companion Voice

## The Two Hats

**Hat 1 (the user)**: You came through the empathy bridge. Someone just said "We hear you. Let's find you somewhere safe tonight." You felt seen. Then the next screen hits you with a bordered card, a numbered circle badge, uppercase "STEP 1" label, a big green button, and a progress bar. It looks like an onboarding wizard for a SaaS product. The warmth vanished. You're back to being processed.

**Hat 2 (the developer with social services background)**: The card container, the step badge, the prominent CTA button. These are all high-literacy UI patterns. They signal "app" not "person." The empathy bridge works because it's just text on a blank page. Nothing to parse, nothing to click, nothing to figure out. The guidance steps should feel the same way. The action (call, directions) should be available but secondary. The words should be primary. Like a friend texting you instructions.

## What's Wrong Right Now

1. **The card border creates distance.** A `rounded-2xl border bg-card` box frames the guidance as "content in a container." The empathy page has no container. Just words.

2. **The step badge is institutional.** A numbered circle with uppercase "STEP 1" feels like a government form. The connector text ("If they can't help, try this next") already provides sequencing naturally.

3. **The action button dominates.** A full-width green `py-3.5 font-semibold` button is the loudest element on the page. The body text (the actual guidance) is `text-sm text-muted-foreground`. The hierarchy is inverted. The guidance should be the hero; the action should be a quiet affordance.

4. **The progress bar + "1 of 3" feels like a queue.** In the follow-up flow it makes sense because you're answering questions. Here, it makes the guidance feel like a checklist to get through rather than a conversation.

## The Solution: Make It Feel Like the Empathy Page, With Actions

Strip the `GuidanceStep` down to match the `TransitionMoment` layout: centered text, no card container, no badges. The action becomes a subtle inline link or understated button beneath the guidance paragraph. The connector text becomes the "headline" (like "We hear you" on the empathy page). The body becomes the main message.

```text
Current:                          Proposed:
┌─────────────────────┐           ┌─────────────────────┐
│ ← Back  ━━━  1 of 3│           │ ← Back              │
│                     │           │                     │
│ ┌─────────────────┐ │           │                     │
│ │ ① Step 1        │ │           │  Here's your        │
│ │                 │ │           │  first step.        │
│ │ Call Emergency  │ │           │                     │
│ │ Shelter Network │ │           │  Call Emergency     │
│ │                 │ │           │  Shelter Network.   │
│ │ They're open... │ │           │  They're open right │
│ │                 │ │           │  now. You can call  │
│ │ ┌─────────────┐ │ │           │  any time, day or   │
│ │ │ 📞 Call     │ │ │           │  night. No ID       │
│ │ └─────────────┘ │ │           │  needed.            │
│ │ 📍 123 Main St  │ │           │                     │
│ │ Learn more →    │ │           │  📞 (215) 555-0107  │
│ └─────────────────┘ │           │  📍 123 Main St     │
│                     │           │                     │
│   Next step →       │           │   Next step →       │
└─────────────────────┘           └─────────────────────┘
```

### Specific Changes

**`GuidanceStep.tsx` rewrite:**
- Remove the card container (`rounded-2xl border bg-card`)
- Remove the step number badge and "STEP X" label
- The connector text becomes the top-line intro, styled like `TransitionMoment`'s "We hear you" (e.g., `text-lg font-semibold text-primary`). For step 1, use "Here's your first step." For step 2+, use the existing connectors.
- The resource name + body text become the main centered paragraph, styled like the empathy message (`text-xl font-bold text-foreground leading-relaxed`)
- The body guidance text sits below, same size, normal weight, as a continuation
- The action (phone/directions/email) becomes a quiet text link with an icon, not a full-width button. Think `text-sm text-primary underline` with a small phone icon. Still tappable, still functional, just not screaming.
- Location link stays as a small `text-xs` line beneath
- Remove "Learn more about X" link (it breaks the companion feel; we can add it to the summary page instead)

**`TriageResults.tsx` adjustments:**
- Remove the progress bar and "X of Y" counter. Replace with just the "Back" button. The pagination still exists (swipe/tap to advance) but without the visual progress tracker that makes it feel like a queue.
- Keep the "Next step" / "See summary" link at the bottom
- The content area should be vertically centered like `TransitionMoment`, not top-aligned

**`guidanceCopy.ts` adjustments:**
- Add a `headline` field to `StepGuidance` for the intro line: "Here's your first step." / "If they can't help, try this next." / "One more option."
- The `action` field changes from "Call Emergency Shelter Network" to just the resource title ("Emergency Shelter Network"), since the verb is implied by the action link below
- Weave the resource name into the `body` naturally: "Call Emergency Shelter Network. They're open right now..."

## Implementation

| File | Change |
|---|---|
| `src/data/guidanceCopy.ts` | Add `headline` field. Merge verb + resource name into `body` opening sentence. Rename connector logic to headline logic. |
| `src/components/GuidanceStep.tsx` | Rewrite to empathy-page layout: no card, no badge, centered text, quiet action links |
| `src/components/TriageResults.tsx` | Remove progress bar and step counter. Center content vertically. Keep back button and next link. |

