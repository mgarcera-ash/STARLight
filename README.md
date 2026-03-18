# STARLight

STARLight is a Vite + React app for STAR resource triage, browsing, and follow-up guidance.

## Local development

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
```

## GitHub Pages deployment

This project deploys through GitHub Actions instead of Lovable hosting.

1. Open `Settings -> Pages` in the GitHub repository.
2. Set `Source` to `GitHub Actions`.
3. Push to `main`, or run the `Deploy to GitHub Pages` workflow from the `Actions` tab.

The workflow builds the app, uploads `dist`, and publishes it to GitHub Pages. During the Actions build, Vite automatically derives the correct project-page base path from the repository name, so asset URLs resolve without hardcoding the repo slug in source code.

## Supabase

The repo already includes `supabase/config.toml`, so the next migration step can be connecting the frontend to a real Supabase project and moving the current local resource state behind that backend.
