# STARLight

STARLight is a Vite + React prototype for STAR resource triage and approved-resource lookup.

## Local development

```sh
npm ci
npm run dev
```

## Production build

```sh
SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... npm run export:resources
npm run build
```

## GitHub Pages deployment

This project deploys through GitHub Actions.

1. Open `Settings -> Pages` in the GitHub repository.
2. Set `Source` to `GitHub Actions`.
3. Add repository variables or secrets named `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
4. Push to `main`, or run the `Deploy to GitHub Pages` workflow from the `Actions` tab.

The deployment workflow exports approved resources from Supabase into `public/resources.json` during the build, then ships the site as a static snapshot. This avoids browser-to-Supabase networking issues on GitHub Pages while keeping the live site aligned with the approved-resource table.

## Supabase prototype setup

1. Copy `.env.example` to `.env` if you want to run the export locally.
2. Run the SQL in `supabase/migrations/20260318_create_resources.sql`.
3. Add approved resources directly in the Supabase dashboard.
4. Run `npm run export:resources` before local production builds if you want the latest snapshot.
