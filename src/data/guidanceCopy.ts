import { Resource } from "@/types";

export interface StepGuidance {
  headline: string;
  body: string;
  actionType: "call" | "directions" | "email";
  actionValue: string;
}

const urgentTags = ["crisis", "tonight", "right-now"];

function isOpen247(hours: string): boolean {
  const h = hours.toLowerCase();
  return h.includes("24/7") || h.includes("24-hour") || h.includes("24 hour");
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

function getActionVerb(resource: Resource): string {
  if (resource.contact.phone) return "Call";
  if (resource.contact.email) return "Email";
  return "Go to";
}

function generateHeadline(stepIndex: number, subTags: string[]): string {
  if (stepIndex === 0) return "Here's your first step.";
  const hasUrgent = subTags.some((t) => urgentTags.includes(t));
  if (stepIndex === 1 && hasUrgent) return "If they can't help right now, try this.";
  if (stepIndex === 1) return "If that doesn't work out, try this next.";
  if (stepIndex === 2) return "One more option.";
  return "You can also try this.";
}

function generateBody(resource: Resource, subTags: string[]): string {
  const parts: string[] = [];
  const is247 = isOpen247(resource.hours);
  const elig = resource.eligibility.toLowerCase();
  const verb = getActionVerb(resource);

  // Opening sentence: weave in the resource name naturally
  parts.push(`${verb} ${resource.title}.`);

  // Hours context
  if (subTags.includes("tonight") && is247) {
    parts.push("They're open right now. You can call any time, day or night.");
  } else if (subTags.includes("tonight") && !is247) {
    parts.push(`Their hours are ${resource.hours}. If they're closed right now, try first thing when they open.`);
  } else if (subTags.includes("crisis") && is247) {
    parts.push("They're available right now, any time of day or night.");
  } else if (subTags.includes("crisis")) {
    parts.push("They specialize in crisis support and can help right away.");
  } else if (subTags.includes("right-now") && is247) {
    parts.push("They're open right now. You can reach them any time.");
  } else if (subTags.includes("right-now")) {
    parts.push(`Their hours are ${resource.hours}. Worth calling now while they're still open.`);
  } else if (is247) {
    parts.push("They're open 24/7, so you can reach them whenever you're ready.");
  } else {
    parts.push(`Their hours are ${resource.hours}.`);
  }

  // Eligibility
  if (elig.includes("no documentation") || elig.includes("no eligibility") || elig.includes("open to all") || elig.includes("anyone")) {
    parts.push("No documents or ID needed. Just reach out.");
  } else {
    if (elig.includes("proof of income")) {
      parts.push("Bring proof of income if you have it, but call first to see what you need.");
    }
    if (elig.includes("income below") || elig.includes("income-eligible") || elig.includes("low-income")) {
      parts.push("They'll ask about your income. Just an estimate is fine.");
    }
    if (elig.includes("referral")) {
      parts.push("You may need a referral. Ask about that when you call.");
    }
  }

  // Who it's for
  if (elig.includes("families with children")) {
    parts.push("Families with children are prioritized, so let them know if you have kids with you.");
  }
  if (elig.includes("18+") || elig.includes("adults")) {
    parts.push("This is for adults 18 and older.");
  }

  // Context-specific warmth
  if (subTags.includes("mental-health")) {
    parts.push("Everything is confidential. You can speak freely.");
  }
  if (subTags.includes("substance-use")) {
    parts.push("They help without judgment. Just be honest about what you need.");
  }
  if (subTags.includes("immigration")) {
    parts.push("They help regardless of immigration status.");
  }
  if (subTags.includes("family")) {
    parts.push("They work with families and understand what you're going through.");
  }

  return parts.join(" ");
}

export function generateContextTips(resource: Resource): string[] {
  if (resource.tips && resource.tips.length > 0) return resource.tips;

  const tips: string[] = [];
  const h = resource.hours.toLowerCase();
  const elig = resource.eligibility.toLowerCase();

  // Hours-based tips
  if (h.includes("mon") && h.includes("am")) {
    const match = resource.hours.match(/(\d{1,2}:\d{2}\s*AM)/i);
    if (match) {
      tips.push(`Try calling right when they open at ${match[1]}. That's usually the best time to get through.`);
    }
  }
  if (h.includes("24/7") || h.includes("24-hour")) {
    tips.push("If you got a busy signal, try again in a few minutes. Off-peak hours (early morning or late evening) tend to be less busy.");
  }

  // Eligibility-based tips
  if (elig.includes("proof of income")) {
    tips.push("If you don't have income documents, ask about self-declaration. Many places accept a written statement.");
  }
  if (elig.includes("referral")) {
    tips.push("Ask if they accept self-referrals. Sometimes you don't actually need one from another agency.");
  }
  if (elig.includes("income below") || elig.includes("income-eligible") || elig.includes("low-income")) {
    tips.push("When they ask about income, an estimate is fine. You don't need exact paperwork on the first call.");
  }

  // Contact-based tips
  if (resource.contact.phone) {
    tips.push("Ask for the intake department specifically — the general line can sometimes send you in circles.");
  }
  if (resource.contact.email && resource.contact.phone) {
    tips.push(`If the phone line is busy, try emailing ${resource.contact.email}. Some places respond faster that way.`);
  }

  return tips.slice(0, 3);
}

export function generateStepGuidance(
  resource: Resource,
  subTags: string[],
  stepIndex: number
): StepGuidance {
  const matchingTags = subTags.filter((t) => resource.subTags.includes(t));

  return {
    headline: generateHeadline(stepIndex, subTags),
    body: generateBody(resource, matchingTags.length > 0 ? matchingTags : subTags),
    actionType: getActionType(resource),
    actionValue: getActionValue(resource),
  };
}
