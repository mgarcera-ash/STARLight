

# Match Splash Color Scheme + Hide Non-Essential Tabs

## Color Scheme

The splash screen uses a deep navy background (`hsl(222, 97%, 18%)`) with the teal-to-cyan gradient text. The triage screen currently uses the default light `bg-background`. The fix: give the triage screen (and follow-up flow + results) the same dark navy background with light text, matching the splash energy.

### Approach
- `TriageScreen.tsx`: Change outer container to dark navy bg with white/light text. Adjust card styling to work on dark background (semi-transparent borders, lighter text).
- `FollowUpFlow.tsx`: Same dark treatment.
- `TriageResults.tsx`: Same dark treatment.
- Add a utility class or inline the splash background color (`bg-[hsl(222,97%,18%)]`) across these three components, with `text-white` base.

## Hiding Tabs

Best approach: **comment out the routes and nav items** with a clear `// HIDDEN: revisit later` marker, rather than deleting files. This way the components stay in the codebase untouched but are inaccessible from the UI.

### Changes
- `BottomNav.tsx`: Hide the entire bottom nav (since "Get Help" is the only active flow and it's already the landing page, there's no need for navigation right now).
- `App.tsx`: Comment out the `/browse`, `/search`, `/submit`, `/review` routes with a `// HIDDEN` marker. Keep the files untouched.

## Files

| File | Change |
|---|---|
| `src/components/TriageScreen.tsx` | Dark navy background, light text, adjusted card styles |
| `src/components/FollowUpFlow.tsx` | Dark navy background, light text |
| `src/components/TriageResults.tsx` | Dark navy background, light text, adjusted card/button styles |
| `src/components/BottomNav.tsx` | Return `null` with comment explaining hidden tabs |
| `src/App.tsx` | Comment out browse/search/submit/review routes with `// HIDDEN` markers |

