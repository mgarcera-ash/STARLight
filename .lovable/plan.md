

## Supabase Migration Plan

### What We're Building

Migrate the app from in-memory seed data to a live Supabase database so resources persist, update in real-time, and can eventually support flyer uploads.

### Steps

#### 1. Enable Lovable Cloud and create the `resources` table

Create a Supabase table matching the current `Resource` type:

```text
resources
├── id              uuid, PK, default gen_random_uuid()
├── title           text, not null
├── description     text, not null
├── categories      text[], not null
├── tags            text[], default '{}'
├── sub_tags        text[], default '{}'
├── eligibility     text, default ''
├── hours           text, default ''
├── contact_phone   text
├── contact_email   text
├── contact_website text
├── location        text, default ''
├── coordinates     jsonb (nullable)
├── featured        boolean, default false
├── urgency         smallint, default 3
├── status          text, default 'pending' (approved/pending/returned)
├── return_comment  text
├── tips            text[]
├── call_script     text
├── flyer_url       text (nullable) ← for future flyer uploads
├── created_at      timestamptz, default now()
├── updated_at      timestamptz, default now()
```

RLS policy: public read for `status = 'approved'`, authenticated write for admin operations.

#### 2. Seed the database

Insert all 20 existing resources from `seed.ts` into the new table via SQL insert statements.

#### 3. Create a `flyers` storage bucket

Public read access for serving flyer images/PDFs. Authenticated write for uploads.

#### 4. Update `ResourceContext.tsx`

- Replace `useState(seedResources)` with a Supabase query (`supabase.from('resources').select()`)
- Add real-time subscription via `supabase.channel()` so any database change instantly updates the UI
- Keep the same `ResourceContextValue` interface so no downstream components need to change
- `submitResource`, `approveResource`, `returnResource` become Supabase mutations instead of local state updates

#### 5. Update `types/index.ts`

- Adjust the `Resource` interface to match the flattened DB columns (e.g., `contact_phone` instead of nested `contact.phone`), or add a mapper function that converts DB rows back to the current nested shape -- keeping all existing components untouched.

#### 6. Keep `seed.ts` as fallback

Retain it for offline/dev use but the production path reads from Supabase.

### What Won't Change

- All UI components (`GuidanceStep`, `TriageResults`, `ResourceCard`, etc.) continue working unchanged
- The `useResources()` hook API stays identical
- The triage flow, guidance copy, and follow-up questions remain static (no DB needed for those yet)

### Technical Notes

- Using Lovable Cloud (preferred) avoids needing an external Supabase account
- The `flyer_url` column is added now but the upload UI can be built later
- Real-time subscriptions mean an admin editing a resource in Supabase dashboard will instantly reflect in the app

