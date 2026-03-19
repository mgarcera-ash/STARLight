import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "public", "resources.json");

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required to export resources.");
}

const params = new URLSearchParams({
  select: [
    "id",
    "title",
    "description",
    "categories",
    "tags",
    "sub_tags",
    "eligibility",
    "hours",
    "contact_phone",
    "contact_email",
    "contact_website",
    "location",
    "coordinates",
    "featured",
    "urgency",
    "status",
    "return_comment",
    "tips",
    "call_script",
    "created_at"
  ].join(","),
  status: "eq.approved",
  order: "featured.desc,urgency.asc,title.asc"
});

const response = await fetch(`${supabaseUrl}/rest/v1/resources?${params.toString()}`, {
  headers: {
    apikey: supabasePublishableKey,
    Authorization: `Bearer ${supabasePublishableKey}`,
    Accept: "application/json"
  }
});

if (!response.ok) {
  const details = await response.text();
  throw new Error(`Failed to export resources (${response.status}): ${details}`);
}

const resources = await response.json();
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(resources, null, 2)}
`, "utf8");

console.log(`Exported ${Array.isArray(resources) ? resources.length : 0} resources to ${outputPath}`);
