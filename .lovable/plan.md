

# Removing Barriers from the Guided Steps

## The Problems

1. **Email tile shown to users who may not have email** — exclusionary dead end
2. **Directions assumes car/map literacy** — doesn't help with transit
3. **Body copy can overwhelm in crisis moments** — too many sentences at once
4. **No "I'm stuck" path** — user can't express that they need help doing the step
5. **No "None of these work" in the step flow** — only option is "Next step" or "Start over"

## The Changes

### 1. Smart action tile logic

Replace the blanket "show Email if email exists" logic with context-aware tiles:

- If the resource has a **website**, show a **"Visit website"** tile (Globe icon) instead of Email. Most people can tap a link even if they can't compose an email.
- If the resource has **email only** (no phone, no website), show **"Message"** with the `mailto:` link — but only as a last resort.
- If the resource has both phone and email, **drop the email tile entirely**. The phone is almost always the better path for this population.

**Rule**: Show at most 2 action tiles per step. Call + Directions, or Call + Website, or Website + Directions. Never three. Simplicity is care.

### 2. Transit-aware directions

- Change the Google Maps URL to include `&travelmode=transit` when the resource has coordinates.
- Rename the tile label from "Directions" to **"How to get there"** — warmer, less formal.
- For resources with `location` containing "phone" or "confidential" (like the DV hotline), **hide the directions tile entirely**.

### 3. Body copy: lead sentence + expandable detail

Split `generateBody` output into two parts:
- **`lead`**: The first 1-2 sentences (action + immediate context). Always shown.
- **`detail`**: Everything else (eligibility, who it's for, warmth). Shown via a soft "Tell me more" expand, same pattern as the tips section.

This reduces cognitive load in crisis while keeping all the information accessible.

### 4. "Need help with this step?" — Peer Navigator link

Below the action tiles and above the "I've tried this before" section, add a subtle text link:

> "Need help with this step? Talk to someone."

This links to the STAR Peer Navigator resource (tel: or the navigator program). It acknowledges that the user might not be able to act alone. It's the companion saying "I can connect you with a real person."

### 5. "This doesn't work for me" on each step

Add a small text option alongside "Next step":

> "This doesn't work for me"

Tapping it skips to the next step but also flags it, so the summary page can say something like "We noticed some of these didn't work. Here are more options." rather than just "That's your plan."

## Files Changed

| File | What |
|---|---|
| `src/components/GuidanceStep.tsx` | Tile logic: max 2, prefer Call+Directions or Call+Website. Hide email unless it's the only option. Rename Directions label. Add "Need help?" link. Split body into lead + expandable detail. |
| `src/data/guidanceCopy.ts` | Split `generateBody` return into `{ lead, detail }`. Update `StepGuidance` interface. |
| `src/components/TriageResults.tsx` | Track skipped steps. Pass skip handler to GuidanceStep. Adjust summary copy when steps were skipped. Add "This doesn't work for me" alongside Next. |
| `src/data/seed.ts` | Add Peer Navigator phone number to STAR resource. Ensure DV hotline location triggers no-directions logic. |

## What This Doesn't Change

- The empathy bridge, triage screen, and follow-up flow stay exactly as they are. They're working.
- The companion voice tone stays the same. We're just making it smarter about what it shows.
- The "I've tried this before" section stays. It's a different escape hatch (context tips vs. "I can't do this at all").

