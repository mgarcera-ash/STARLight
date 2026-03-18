import { Tables } from "@/integrations/supabase/types";
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

export type ResourceRow = Tables<"resources">;

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
  };
}

export function normalizeResourceRow(row: ResourceRow): Resource {
  return normalizeResource({
    id: row.id,
    title: row.title,
    description: row.description,
    categories: row.categories,
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
  });
}

export function normalizeResourceRows(rows: ResourceRow[] | null | undefined) {
  return (rows ?? []).map(normalizeResourceRow);
}
