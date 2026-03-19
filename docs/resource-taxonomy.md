# Resource Taxonomy

STARLight keeps all services in one `resources` table and classifies them with layered fields.

## Core fields

- `domain`: broad need area such as `housing`, `food`, `healthcare`, `legal`, `community`, `internal_programs`
- `resource_type`: specific service type such as `emergency_shelter`, `transitional_housing`, `food_pantry`, `clinic`, `legal_aid`
- `population_tags`: who the resource is intended for, such as `men`, `women`, `families`, `youth`, `veterans`, `seniors`
- `accessibility_tags`: access-related flags such as `wheelchair_accessible`, `ground_floor`, `elevator`
- `service_tags`: operational or descriptive tags that improve filtering without creating new top-level categories

## Shelter examples

### Men's emergency shelter
- `domain = housing`
- `resource_type = emergency_shelter`
- `population_tags = ['men', 'single_adults']`
- `availability_type = twenty_four_hours` or `overnight`
- `beds = <known count>`

### Family shelter
- `domain = housing`
- `resource_type = emergency_shelter`
- `population_tags = ['families']`

### Youth shelter
- `domain = housing`
- `resource_type = emergency_shelter`
- `population_tags = ['youth']`

## Import guidance

- Keep existing `categories`, `tags`, and `sub_tags` for backward compatibility during migration.
- Prefer `domain` plus `resource_type` over inventing more top-level categories.
- Use `source_dataset` and `source_record_id` on imports so future re-imports can dedupe reliably.
- Treat `service_tags` as lightweight searchable labels, not as a replacement for `domain` or `resource_type`.
