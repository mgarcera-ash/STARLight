# Importing Shelter CSVs

This repo includes `scripts/generate_shelter_import.py` to turn shelter spreadsheets into import-ready SQL for `public.resources`.

## Current assumptions

The script is designed for CSVs with these columns:

- `Agency`
- `Address`
- `Availability`
- `Beds`
- `Elevator`
- `Notes`
- `Phone`
- `Wheelchair Accessible`

## Output mapping

Each imported row is classified as:

- `domain = housing`
- `resource_type = emergency_shelter`
- `categories = ['Housing']`
- `population_tags = ['men', 'single_adults']` for the current men's shelter dataset
- `sub_tags` includes `tonight` and `short-term` so the current housing triage can surface shelters

The script also derives:

- `beds` from the `Beds` column
- `availability_type` from `Availability`
- `accessibility_tags` from elevator and wheelchair fields plus notes
- `service_tags` from notable operational details in notes
- `tips` from note bullets
- `source_dataset` and `source_record_id` for re-import traceability

## Usage

```sh
python3 scripts/generate_shelter_import.py \
  '/path/to/input.csv' \
  'supabase/seeds/output.sql' \
  --dataset 'dataset_identifier'
```

Then run the generated SQL in Supabase.

## Re-import behavior

Generated SQL starts with:

- `delete from public.resources where source_dataset = ...`

That makes re-running the same dataset idempotent for that dataset batch.
