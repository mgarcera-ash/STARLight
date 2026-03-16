

# Triage-First User Journey

## Flow

```text
NFC tap → Splash (2s) → Triage Screen → Results Screen → Detail Page
                              ↑                               
                         Always the landing page
                         Browse available via bottom nav
```

## Triage Screen (new default landing)

Full-screen, warm, minimal. Header: "What do you need help with?" in plain language. Below: 6 large tappable cards with icons and human-readable labels (not category jargon):

| Internal Category | User-Facing Label |
|---|---|
| Housing | "A place to stay" |
| Food | "Food or meals" |
| Healthcare | "Medical or health care" |
| Legal | "Legal help" |
| Community | "People & support" |
| Internal Programs | "Workplace programs" |

Multi-select with visual checkmark state. A prominent "Show me my options" button at the bottom, disabled until at least one selected.

## Results Screen

After tapping "Show me my options":
- **Priority card** at top — the single most immediate/urgent resource for their selected needs, visually distinct (larger, accented border, "Start here" label)
- Below: remaining matching resources in a clean list/grid
- Filter chips at top showing their selected needs, tappable to toggle

Each resource in the seed data gets a new `urgency` field (1-3) so we can sort by it.

## Changes to Existing Structure

- **Index.tsx**: Landing is now the Triage screen, not BrowseHome
- **New: `TriageScreen.tsx`**: The "What do you need?" multi-select screen
- **New: `TriageResults.tsx`**: Priority-first results view
- **BrowseHome.tsx**: Moved to its own route `/browse`, accessible from bottom nav
- **BottomNav.tsx**: "Home" icon goes to triage (`/`), "Browse" becomes a separate nav item
- **seed.ts / types**: Add `urgency: 1 | 2 | 3` field to Resource type (1 = most urgent)
- **ResourceContext**: Add `getResourcesByNeeds(categories[])` that returns sorted by urgency

## Files

| File | Action |
|---|---|
| `src/types/index.ts` | Add `urgency` field |
| `src/data/seed.ts` | Add urgency values to all resources |
| `src/components/TriageScreen.tsx` | New — need selection UI |
| `src/components/TriageResults.tsx` | New — priority-first results |
| `src/pages/Index.tsx` | Render triage flow instead of BrowseHome |
| `src/pages/Browse.tsx` | New — wraps existing BrowseHome |
| `src/components/BottomNav.tsx` | Update nav items |
| `src/context/ResourceContext.tsx` | Add needs-based query |
| `src/App.tsx` | Add `/browse` route |

