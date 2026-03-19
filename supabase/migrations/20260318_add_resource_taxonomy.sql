alter table public.resources
  add column if not exists domain text,
  add column if not exists resource_type text,
  add column if not exists population_tags text[] not null default '{}',
  add column if not exists accessibility_tags text[] not null default '{}',
  add column if not exists service_tags text[] not null default '{}',
  add column if not exists availability_type text,
  add column if not exists beds integer,
  add column if not exists intake_type text,
  add column if not exists source_dataset text,
  add column if not exists source_record_id text;

alter table public.resources
  drop constraint if exists resources_beds_nonnegative;

alter table public.resources
  add constraint resources_beds_nonnegative
  check (beds is null or beds >= 0);

update public.resources
set
  domain = coalesce(
    domain,
    case
      when categories @> array['Housing']::text[] then 'housing'
      when categories @> array['Food']::text[] then 'food'
      when categories @> array['Healthcare']::text[] then 'healthcare'
      when categories @> array['Legal']::text[] then 'legal'
      when categories @> array['Community']::text[] then 'community'
      when categories @> array['Internal Programs']::text[] then 'internal_programs'
      else 'general'
    end
  ),
  resource_type = coalesce(
    resource_type,
    case
      when categories @> array['Housing']::text[] then 'housing_resource'
      when categories @> array['Food']::text[] then 'food_resource'
      when categories @> array['Healthcare']::text[] then 'healthcare_resource'
      when categories @> array['Legal']::text[] then 'legal_service'
      when categories @> array['Community']::text[] then 'community_resource'
      when categories @> array['Internal Programs']::text[] then 'internal_program'
      else 'general_resource'
    end
  ),
  service_tags = case
    when cardinality(service_tags) > 0 then service_tags
    else (
      select coalesce(array_agg(distinct value order by value), '{}'::text[])
      from unnest(coalesce(tags, '{}'::text[]) || coalesce(sub_tags, '{}'::text[])) as value
      where btrim(value) <> ''
    )
  end,
  accessibility_tags = case
    when cardinality(accessibility_tags) > 0 then accessibility_tags
    else (
      select coalesce(array_agg(distinct value order by value), '{}'::text[])
      from (
        select case
          when lower(value) in ('wheelchair', 'wheelchair-accessible', 'wheelchair_accessible') then 'wheelchair_accessible'
          when lower(value) in ('ground-floor', 'ground_floor', 'ground floor') then 'ground_floor'
          when lower(value) in ('accessible', 'ada') then 'accessible'
          else null
        end as value
        from unnest(coalesce(tags, '{}'::text[]) || coalesce(sub_tags, '{}'::text[])) as value
      ) normalized
      where value is not null
    )
  end,
  population_tags = case
    when cardinality(population_tags) > 0 then population_tags
    else (
      select coalesce(array_agg(distinct value order by value), '{}'::text[])
      from (
        select case
          when lower(value) in ('men', 'male', 'single-men', 'single_men') then 'men'
          when lower(value) in ('women', 'female', 'single-women', 'single_women') then 'women'
          when lower(value) in ('family', 'families') then 'families'
          when lower(value) in ('youth', 'young-adults', 'young_adults') then 'youth'
          when lower(value) in ('veteran', 'veterans') then 'veterans'
          when lower(value) in ('senior', 'seniors', 'older-adults', 'older_adults') then 'seniors'
          else null
        end as value
        from unnest(coalesce(tags, '{}'::text[]) || coalesce(sub_tags, '{}'::text[])) as value
      ) normalized
      where value is not null
    )
  end,
  availability_type = coalesce(
    availability_type,
    case
      when lower(hours) like '%24/7%' or lower(hours) like '%24hr%' or lower(hours) like '%24 hr%' then 'twenty_four_hours'
      when lower(hours) like '%overnight%' then 'overnight'
      when btrim(hours) = '' then null
      else 'scheduled'
    end
  );

create index if not exists resources_domain_idx on public.resources (domain);
create index if not exists resources_resource_type_idx on public.resources (resource_type);
create index if not exists resources_availability_type_idx on public.resources (availability_type);
create index if not exists resources_status_domain_idx on public.resources (status, domain);
create index if not exists resources_population_tags_gin_idx on public.resources using gin (population_tags);
create index if not exists resources_accessibility_tags_gin_idx on public.resources using gin (accessibility_tags);
create index if not exists resources_service_tags_gin_idx on public.resources using gin (service_tags);

comment on column public.resources.domain is 'Top-level service domain such as housing, food, healthcare, legal, community, or internal_programs.';
comment on column public.resources.resource_type is 'Structured service type such as emergency_shelter, transitional_housing, food_pantry, clinic, or legal_aid.';
comment on column public.resources.population_tags is 'Who the resource is intended for, such as men, women, families, youth, veterans, or seniors.';
comment on column public.resources.accessibility_tags is 'Physical access or accommodation tags such as wheelchair_accessible or ground_floor.';
comment on column public.resources.service_tags is 'Operational or descriptive tags that support filtering without overloading top-level categories.';
comment on column public.resources.availability_type is 'Normalized availability bucket such as twenty_four_hours, overnight, or scheduled.';
comment on column public.resources.beds is 'Structured bed count for shelters and housing resources when known.';
comment on column public.resources.intake_type is 'How intake works, such as walk_in, referral, lottery, appointment, or call_first.';
comment on column public.resources.source_dataset is 'Optional import batch or spreadsheet identifier for traceability.';
comment on column public.resources.source_record_id is 'Optional source-system row identifier for deduping and re-imports.';
