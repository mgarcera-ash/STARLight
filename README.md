# STARLight

STARLight is a Vite + React prototype for STAR resource triage and approved-resource lookup.

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

This project deploys through GitHub Actions.

1. Open `Settings -> Pages` in the GitHub repository.
2. Set `Source` to `GitHub Actions`.
3. Push to `main`, or run the `Deploy to GitHub Pages` workflow from the `Actions` tab.

## Supabase prototype setup

This repo now treats Supabase as a fresh integration pass.

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Run the SQL in `supabase/migrations/20260318_create_resources.sql`.
4. In GitHub, add either repository variables or repository secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Add approved resources directly in the Supabase dashboard.

The GitHub Pages workflow now fails fast if those values are missing, so it will not silently ship a seed-data build when Supabase config is absent.
