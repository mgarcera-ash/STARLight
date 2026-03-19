import { Category, Resource } from "@/types";

const VALID_CATEGORIES: Category[] = [
  "Housing",
  "Food",
  "Healthcare",
  "Legal",
  "Community",
  "Internal Programs",
];

const VALID_STATUSES: Resource["status"][] = ["approved", "pending", "returned"];

export const RESOURCE_SELECT_FIELDS = `
  id,
  title,
  description,
  categories,
  tags,
  sub_tags,
  eligibility,
  hours,
  contact_phone,
  contact_email,
  contact_website,
  location,
  coordinates,
  featured,
  urgency,
  status,
  return_comment,
  tips,
  call_script,
  created_at,
  domain,
  resource_type,
  population_tags,
  accessibility_tags,
  service_tags,
  availability_type,
  beds,
  intake_type,
  source_dataset,
  source_record_id
`;

export interface ResourceRow {
  id: string;
  title: string;
  description: string;
  categories: string[] | null;
  tags: string[] | null;
  sub_tags: string[] | null;
  eligibility: string | null;
  hours: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_website: string | null;
  location: string | null;
  coordinates: unknown;
  featured: boolean | null;
  urgency: number | null;
  status: string | null;
  return_comment: string | null;
  tips: string[] | null;
  call_script: string | null;
  created_at: string;
  domain: string | null;
  resource_type: string | null;
  population_tags: string[] | null;
  accessibility_tags: string[] | null;
  service_tags: string[] | null;
  availability_type: string | null;
  beds: number | null;
  intake_type: string | null;
  source_dataset: string | null;
  source_record_id: string | null;
}

function isCategory(value: string): value is Category {
  return VALID_CATEGORIES.includes(value as Category);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeCategoryList(values: string[] | null | undefined): Category[] {
  return (values ?? []).filter(isCategory);
}

function normalizeStringList(values: string[] | null | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function normalizeCoordinates(value: unknown): Resource["coordinates"] | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const lat = Reflect.get(value, "lat");
  const lng = Reflect.get(value, "lng");

  if (typeof lat === "number" && typeof lng === "number") {
    return { lat, lng };
  }

  return undefined;
}

function normalizeStatus(value: string | null | undefined): Resource["status"] {
  return VALID_STATUSES.includes(value as Resource["status"])
    ? (value as Resource["status"])
    : "approved";
}

function normalizeUrgency(value: number | null | undefined): Resource["urgency"] {
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }

  return 3;
}

function normalizeBeds(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return undefined;
  }

  return Math.round(value);
}

export function normalizeResource(resource: Partial<Resource> & Pick<Resource, "id" | "title" | "description">): Resource {
  return {
    id: resource.id,
    title: normalizeText(resource.title),
    description: normalizeText(resource.description),
    categories: normalizeCategoryList(resource.categories),
    tags: normalizeStringList(resource.tags),
    subTags: normalizeStringList(resource.subTags),
    eligibility: normalizeText(resource.eligibility),
    hours: normalizeText(resource.hours),
    contact: {
      phone: normalizeOptionalText(resource.contact?.phone),
      email: normalizeOptionalText(resource.contact?.email),
      website: normalizeOptionalText(resource.contact?.website),
    },
    location: normalizeText(resource.location),
    coordinates: normalizeCoordinates(resource.coordinates),
    featured: Boolean(resource.featured),
    urgency: normalizeUrgency(resource.urgency),
    status: normalizeStatus(resource.status),
    returnComment: normalizeOptionalText(resource.returnComment),
    tips: normalizeStringList(resource.tips),
    callScript: normalizeOptionalText(resource.callScript),
    createdAt: normalizeText(resource.createdAt) || new Date().toISOString().split("T")[0],
    domain: normalizeOptionalText(resource.domain),
    resourceType: normalizeOptionalText(resource.resourceType),
    populationTags: normalizeStringList(resource.populationTags),
    accessibilityTags: normalizeStringList(resource.accessibilityTags),
    serviceTags: normalizeStringList(resource.serviceTags),
    availabilityType: normalizeOptionalText(resource.availabilityType),
    beds: normalizeBeds(resource.beds),
    intakeType: normalizeOptionalText(resource.intakeType),
    sourceDataset: normalizeOptionalText(resource.sourceDataset),
    sourceRecordId: normalizeOptionalText(resource.sourceRecordId),
  };
}

export function normalizeResourceRow(row: ResourceRow): Resource {
  return normalizeResource({
    id: row.id,
    title: row.title,
    description: row.description,
    categories: row.categories ?? [],
    tags: row.tags ?? [],
    subTags: row.sub_tags ?? [],
    eligibility: row.eligibility ?? "",
    hours: row.hours ?? "",
    contact: {
      phone: row.contact_phone ?? undefined,
      email: row.contact_email ?? undefined,
      website: row.contact_website ?? undefined,
    },
    location: row.location ?? "",
    coordinates: row.coordinates,
    featured: row.featured ?? false,
    urgency: row.urgency ?? 3,
    status: row.status ?? "approved",
    returnComment: row.return_comment ?? undefined,
    tips: row.tips ?? [],
    callScript: row.call_script ?? undefined,
    createdAt: row.created_at,
    domain: row.domain ?? undefined,
    resourceType: row.resource_type ?? undefined,
    populationTags: row.population_tags ?? [],
    accessibilityTags: row.accessibility_tags ?? [],
    serviceTags: row.service_tags ?? [],
    availabilityType: row.availability_type ?? undefined,
    beds: row.beds ?? undefined,
    intakeType: row.intake_type ?? undefined,
    sourceDataset: row.source_dataset ?? undefined,
    sourceRecordId: row.source_record_id ?? undefined,
  });
}

export function normalizeResourceRows(rows: ResourceRow[] | null | undefined) {
  return (rows ?? []).map(normalizeResourceRow);
}
