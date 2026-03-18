import { Resource } from "@/types";

export interface StepGuidance {
  headline: string;
  lead: string;
  detail: string;
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

function generateLeadAndDetail(resource: Resource, subTags: string[]): { lead: string; detail: string } {
  const leadParts: string[] = [];
  const detailParts: string[] = [];
  const is247 = isOpen247(resource.hours);
  const elig = resource.eligibility.toLowerCase();
  const verb = getActionVerb(resource);

  // Lead: action + immediate hours context (1-2 sentences max)
  leadParts.push(`${verb} ${resource.title}.`);

  if (subTags.includes("tonight") && is247) {
    leadParts.push("They're open right now. You can call any time, day or night.");
  } else if (subTags.includes("tonight") && !is247) {
    leadParts.push("They might be closed right now — check the hours below.");
  } else if (subTags.includes("crisis") && is247) {
    leadParts.push("They're available right now, any time of day or night.");
  } else if (subTags.includes("crisis")) {
    leadParts.push("They specialize in crisis support and can help right away.");
  } else if (subTags.includes("right-now") && is247) {
    leadParts.push("They're open right now. You can reach them any time.");
  } else if (subTags.includes("right-now")) {
    leadParts.push("Worth calling now while they're still open.");
  } else if (is247) {
    leadParts.push("They're open 24/7, so you can reach them whenever you're ready.");
  } else {
    leadParts.push("Here's when they're available.");
  }

  // Detail: eligibility, who it's for, warmth (everything else)
  if (elig.includes("no documentation") || elig.includes("no eligibility") || elig.includes("open to all") || elig.includes("anyone")) {
    detailParts.push("No documents or ID needed. Just reach out.");
  } else {
    if (elig.includes("proof of income")) {
      detailParts.push("Bring proof of income if you have it, but call first to see what you need.");
    }
    if (elig.includes("income below") || elig.includes("income-eligible") || elig.includes("low-income")) {
      detailParts.push("They'll ask about your income. Just an estimate is fine.");
    }
    if (elig.includes("referral")) {
      detailParts.push("You may need a referral. Ask about that when you call.");
    }
  }

  if (elig.includes("families with children")) {
    detailParts.push("Families with children are prioritized, so let them know if you have kids with you.");
  }
  if (elig.includes("18+") || elig.includes("adults")) {
    detailParts.push("This is for adults 18 and older.");
  }

  if (subTags.includes("mental-health")) {
    detailParts.push("Everything is confidential. You can speak freely.");
  }
  if (subTags.includes("substance-use")) {
    detailParts.push("They help without judgment. Just be honest about what you need.");
  }
  if (subTags.includes("immigration")) {
    detailParts.push("They help regardless of immigration status.");
  }
  if (subTags.includes("family")) {
    detailParts.push("They work with families and understand what you're going through.");
  }

  return {
    lead: leadParts.join(" "),
    detail: detailParts.join(" "),
  };
}

export function generateCallScript(resource: Resource, subTags: string[]): string | null {
  if (!resource.contact.phone) return null;
  if (resource.callScript) return resource.callScript;

  // Generate a sensible fallback based on category/tags
  const cat = resource.categories[0];
  if (subTags.includes("tonight") || subTags.includes("crisis")) {
    return `Say: Hi, I need help right now. Can someone talk to me?`;
  }
  switch (cat) {
    case "Housing": return "Say: Hi, I need help with housing. What are my options?";
    case "Food": return "Say: Hi, I'd like to get food. What do I need to bring?";
    case "Healthcare": return "Say: Hi, I need to see someone but I don't have insurance. Can you help?";
    case "Legal": return "Say: Hi, I have a legal question and I can't afford a lawyer. Can someone help me?";
    case "Community": return "Say: Hi, I heard you have programs that might help me. Can you tell me more?";
    default: return "Say: Hi, I was told you might be able to help me. Can I talk to someone?";
  }
}

export function generateContextTips(resource: Resource): string[] {
  if (resource.tips && resource.tips.length > 0) return resource.tips;

  const tips: string[] = [];
  const h = resource.hours.toLowerCase();
  const elig = resource.eligibility.toLowerCase();

  if (h.includes("mon") && h.includes("am")) {
    const match = resource.hours.match(/(\d{1,2}:\d{2}\s*AM)/i);
    if (match) {
      tips.push(`Try calling right when they open at ${match[1]}. That's usually the best time to get through.`);
    }
  }
  if (h.includes("24/7") || h.includes("24-hour")) {
    tips.push("If you got a busy signal, try again in a few minutes. Off-peak hours (early morning or late evening) tend to be less busy.");
  }

  if (elig.includes("proof of income")) {
    tips.push("If you don't have income documents, ask about self-declaration. Many places accept a written statement.");
  }
  if (elig.includes("referral")) {
    tips.push("Ask if they accept self-referrals. Sometimes you don't actually need one from another agency.");
  }
  if (elig.includes("income below") || elig.includes("income-eligible") || elig.includes("low-income")) {
    tips.push("When they ask about income, an estimate is fine. You don't need exact paperwork on the first call.");
  }

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
  const effectiveTags = matchingTags.length > 0 ? matchingTags : subTags;
  const { lead, detail } = generateLeadAndDetail(resource, effectiveTags);

  return {
    headline: generateHeadline(stepIndex, subTags),
    lead,
    detail,
    actionType: getActionType(resource),
    actionValue: getActionValue(resource),
  };
}
