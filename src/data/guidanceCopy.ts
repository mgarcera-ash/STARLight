import { Resource } from "@/types";

interface StepGuidance {
  action: string;       // "Call Emergency Shelter Network"
  why: string;          // "They're open 24/7 and can help you find a bed tonight."
  connector: string;    // (step 2+) "If they can't help tonight"
  prepPoints: string[]; // ["No documents needed", "Families with children are prioritized"]
  actionType: "call" | "directions" | "email";
  actionValue: string;  // phone number, address, or email
}

// Priority order for urgency-matching sub-tags
const urgentTags = ["crisis", "tonight", "right-now"];

function isOpen247(hours: string): boolean {
  const h = hours.toLowerCase();
  return h.includes("24/7") || h.includes("24-hour") || h.includes("24 hour");
}

function getActionVerb(resource: Resource): "Call" | "Go to" | "Email" {
  if (resource.contact.phone) return "Call";
  if (resource.contact.email) return "Email";
  return "Go to";
}

function getActionType(resource: Resource): StepGuidance["actionType"] {
  if (resource.contact.phone) return "call";
  if (resource.contact.email) return "email";
  return "directions";
}

function getActionValue(resource: Resource): string {
  if (resource.contact.phone) return resource.contact.phone;
  if (resource.contact.email) return resource.contact.email;
  return resource.location;
}

function generateWhy(resource: Resource, subTags: string[]): string {
  const is247 = isOpen247(resource.hours);
  const hasUrgent = subTags.some((t) => urgentTags.includes(t));

  if (subTags.includes("tonight") && is247) {
    return "They're open right now and can help you find a place tonight.";
  }
  if (subTags.includes("tonight") && !is247) {
    return `They can help with shelter. Their hours are ${resource.hours}.`;
  }
  if (subTags.includes("crisis") && is247) {
    return "They're available right now, any time of day or night.";
  }
  if (subTags.includes("crisis")) {
    return "They specialize in crisis support and can help right away.";
  }
  if (subTags.includes("right-now") && is247) {
    return "They're open right now and can help you today.";
  }
  if (subTags.includes("right-now")) {
    return `They can help you soon. Their hours are ${resource.hours}.`;
  }
  if (subTags.includes("mental-health")) {
    return "They offer confidential support and counseling.";
  }
  if (subTags.includes("substance-use")) {
    return "They offer treatment and support without judgment.";
  }
  if (subTags.includes("immigration")) {
    return "They help regardless of immigration status.";
  }
  if (subTags.includes("family")) {
    return "They work with families and understand what you're going through.";
  }
  if (is247) {
    return "They're open 24/7.";
  }
  if (hasUrgent) {
    return `They can help. Their hours are ${resource.hours}.`;
  }
  return `Their hours are ${resource.hours}.`;
}

function generateConnector(stepIndex: number, resource: Resource, subTags: string[]): string {
  if (stepIndex === 0) return "";

  const hasUrgent = subTags.some((t) => urgentTags.includes(t));

  // Check if the previous step's category differs
  if (stepIndex === 1 && hasUrgent) {
    return "If they can't help right now, try this";
  }
  if (stepIndex === 1) {
    return "If that doesn't work out, try this next";
  }
  if (stepIndex === 2) {
    return "Another option that could help";
  }
  return "You can also try";
}

function extractPrepPoints(resource: Resource): string[] {
  const points: string[] = [];
  const elig = resource.eligibility.toLowerCase();

  // No docs needed
  if (elig.includes("no documentation") || elig.includes("no eligibility") || elig.includes("open to all")) {
    points.push("No documents or ID needed");
  } else {
    // Extract key requirements
    if (elig.includes("proof of income")) {
      points.push("Bring proof of income if you have it");
    }
    if (elig.includes("income below") || elig.includes("income-eligible") || elig.includes("low-income")) {
      points.push("They'll ask about your income — just an estimate is fine");
    }
    if (elig.includes("referral")) {
      points.push("You may need a referral — ask when you call");
    }
  }

  // Who it's for
  if (elig.includes("families with children")) {
    points.push("Families with children are prioritized");
  }
  if (elig.includes("anyone")) {
    points.push("Open to everyone — no requirements");
  }
  if (elig.includes("18+") || elig.includes("adults")) {
    points.push("For adults 18 and older");
  }

  // Hours context
  if (isOpen247(resource.hours)) {
    points.push("Open 24/7 — you can reach them any time");
  }

  // Fallback
  if (points.length === 0) {
    points.push(resource.eligibility);
  }

  return points;
}

export function generateStepGuidance(
  resource: Resource,
  subTags: string[],
  stepIndex: number
): StepGuidance {
  const verb = getActionVerb(resource);
  const matchingTags = subTags.filter((t) => resource.subTags.includes(t));

  return {
    action: `${verb} ${resource.title}`,
    why: generateWhy(resource, matchingTags.length > 0 ? matchingTags : subTags),
    connector: generateConnector(stepIndex, resource, subTags),
    prepPoints: extractPrepPoints(resource),
    actionType: getActionType(resource),
    actionValue: getActionValue(resource),
  };
}
