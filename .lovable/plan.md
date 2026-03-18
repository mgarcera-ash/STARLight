

# Empathy Bridge: A Transition Moment Between Questions and Results

## The Problem (Wearing Both Hats)

**As the user**: You just told this app something vulnerable. "I need somewhere tonight." "I'm in crisis right now." Then it snaps to a clinical list: "Here's what we recommend." No pause. No acknowledgment. It feels like a form, not a friend. The emotional whiplash makes you distrust it — this thing didn't hear me, it processed me.

**As the developer with a social services lens**: This is a known dropout point. When someone in crisis encounters a system that feels transactional, they disengage. Digital literacy compounds this — if the interface suddenly shifts from simple questions to a dense card layout with buttons, gradients, and expandable sections, it reads as "this isn't for me." The cognitive load spikes at the worst possible moment.

## What's Missing

There's no **bridge** between vulnerability and utility. The system needs to do three things that a good caseworker does instinctively:

1. **Reflect** — show the person you heard them
2. **Reassure** — tell them something good is coming
3. **Ease in** — don't dump everything at once

## The Solution: A "We Hear You" Transition Screen

A new component — `TransitionMoment` — that sits between `FollowUpFlow` completing and `TriageResults` rendering. It lasts 3-4 seconds (auto-advances, or tap to continue), and shows a personalized, warm message based on what they just told you.

### What It Looks Like

Same dark navy background. Centered text, gentle fade-in. No buttons, no cards, no UI chrome. Just words.

```text
┌─────────────────────────┐
│                         │
│                         │
│    We hear you.         │
│                         │
│    Let's find you       │
│    somewhere safe       │
│    tonight.             │
│                         │
│                         │
│    · · ·                │
│    (subtle loading)     │
│                         │
│                         │
└─────────────────────────┘
```

### Personalized Copy

The message adapts to what the user answered. Not AI-generated — hand-written lines mapped to sub-tags:

| Sub-tag | Message |
|---|---|
| `tonight` | "Let's find you somewhere safe tonight." |
| `right-now` | "Let's get you something to eat right now." |
| `crisis` | "You're not alone. Let's get you help right now." |
| `mental-health` | "Taking this step matters. Let's find the right support." |
| `substance-use` | "We're glad you're here. Let's find the right help." |
| `wheelchair` / `ground-floor` | "Let's find a place that works for you." |
| `short-term` / `long-term` | "Let's find you some options." |
| `this-week` / `ongoing` | "Let's find something that fits." |
| `immigration` | "Let's connect you with someone who can help." |
| `family` | "That's a lot to carry. Let's find support." |
| (fallback) | "We're looking for the best options for you." |

The system picks the most urgent/emotional sub-tag from the user's answers (priority: crisis > tonight > right-now > others) and uses that line.

### Also: Soften the Results Copy

While we're at it, update `TriageResults` header copy:

- **Current**: "Here's what we recommend" / "Based on what you told us, these fit best."
- **New**: "We found some places that can help" / "These are picked for your situation. Tap any to learn more."

And "Start here" label becomes "This is your best first step."

## Implementation

| File | Change |
|---|---|
| `src/components/TransitionMoment.tsx` | **New** — full-screen empathy bridge with personalized copy, auto-advance after ~3.5s or tap to continue |
| `src/data/transitionCopy.ts` | **New** — sub-tag to message mapping with priority ordering |
| `src/pages/Index.tsx` | Add `showTransition` state between follow-up completion and results rendering |
| `src/components/TriageResults.tsx` | Update header copy to warmer language |

## Flow Update

```text
splash → triage → followUp → transitionMoment (3.5s) → results
                                    ↑
                        "We hear you. Let's find you
                         somewhere safe tonight."
```

