

# Conversational Card: One Step, One Breath

## The Problem

We keep trying to pace the *internals* of a step (headline → buttons → script → tips) with scroll/tap/blur mechanics. Every version feels mechanical because we're treating UI widgets as narrative beats. A friend doesn't drip-feed you a phone number.

## The Insight

The right unit of progressive disclosure is **between steps**, not within them. Each step should land as one complete, warm message. Like receiving a text:

> "Hey — I found a place. Call Project HOME. They're open right now, 24/7. No ID needed. When they pick up, just say 'Hi, I need help with housing.' That's it. They'll take it from there."

Everything the person needs is right there. No tapping. No revealing. One screen, one breath.

## The New Step Layout

```text
┌──────────────────────┐
│                      │
│  Here's your         │
│  first step.         │
│                      │
│  Call Project HOME.  │
│  They're open right  │
│  now, 24/7. No ID   │
│  needed.             │
│                      │
│  ┌────┐  ┌────────┐  │
│  │Call │  │Get there│  │
│  └────┘  └────────┘  │
│                      │
│  ┌──────────────────┐│
│  │ When they pick   ││
│  │ up, just say:    ││
│  │ "Hi, I need help ││
│  │ with housing."   ││
│  └──────────────────┘│
│                      │
│  ─────────────────── │
│  Need help with this │
│  step? Talk to       │
│  someone.            │
│                      │
│  This doesn't work   │
│  for me              │
│                      │
│     Next step →      │
│                      │
└──────────────────────┘
```

Everything visible. No tap-to-reveal. No scroll-to-unlock. Just a page you can read top to bottom, like a message from a friend.

The pacing comes from the **staggered fade-in** — headline appears first (0s), body text (0.15s), action tiles (0.4s), call script (0.6s), navigation (0.8s). It *feels* like it's being written for you in real time. But it's all there within ~1 second. No interaction required.

## What Changes

### `src/components/GuidanceStep.tsx` — Major simplification
- **Remove**: `revealedCount`, `LayoutGroup`, `TapPrompt`, `TapPulse`, `DotIndicator`, `handleTap`, all progressive reveal logic
- **Remove**: `overflow-hidden` toggling, `AnimatePresence` around sections, conditional rendering based on reveal state
- **Keep**: All section content (intro, action tiles, call script, navigation/tips)
- **New layout**: Single scrollable column (`overflow-y-auto`) from the start. No locked states
- **Staggered entrance**: Each section gets an increasing `delay` on its fade-in animation (0s → 0.15s → 0.4s → 0.6s → 0.8s). The content "writes itself" onto the screen
- **Intro section**: No longer `min-h-[100dvh]`. Uses normal top padding (`pt-12`) so the headline starts high, like a message
- **Tips section**: Move behind a gentle expandable ("Tried this before?") instead of always showing — keeps the default view short and focused

### `src/components/TriageResults.tsx` — No changes
The step-to-step pagination already works well and is the right pacing mechanism.

### `src/data/guidanceCopy.ts` — No changes
The copy engine already generates warm, conversational text.

## Why This Works for Our First User

- **No hidden mechanics to learn**. No tapping, no scrolling to unlock. The page is just... there.
- **Feels like someone wrote this for me**. The stagger makes it feel composed, not dumped. But it doesn't require me to do anything.
- **I can act immediately**. The Call button is right there. I don't have to tap three times to find it.
- **It's not overwhelming** because it's one resource, written as one thought, with clear white space.
- **The pacing I need is between steps** — "Next step →" is the only decision I make. One resource at a time. One friend saying "try this, and if it doesn't work, I have another idea."

## The Companion Feel Without AI

The companion feeling comes from three things already in the codebase:
1. **The copy engine** (`guidanceCopy.ts`) already writes like a person — "They're open right now. No ID needed. Just reach out."
2. **The call script** already says "That's it. They'll take it from there." — that's a friend reassuring you.
3. **The step sequence** already says "If that doesn't work out, try this next" — that's someone who has a backup plan for you.

We don't need progressive reveal to create intimacy. The words already do that. We just need to stop hiding them behind interaction mechanics.

