import { Resource } from "@/types";
import { parseHours, getOpenStatus } from "@/components/HoursIndicator";

export interface StepGuidance {
  headline: string;
  lead: string;
  detail: string;
  actionType: "call" | "directions" | "email";
  actionValue: string;
}

const urgentTags = ["crisis", "tonight", "right-now"];

function isOpen247(hours: string): boolean {
  const lowerHours = hours.toLowerCase();
  return lowerHours.includes("24/7") || lowerHours.includes("24-hour") || lowerHours.includes("24 hour") || lowerHours.includes("24hr");
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
  if (resource.contact.phone) return "Call the";
  if (resource.contact.email) return "Email the";
  return "Go to the";
}

function generateHeadline(stepIndex: number, subTags: string[]): string {
  if (stepIndex === 0) return "Here’s a strong first step.";
  const hasUrgent = subTags.some((tag) => urgentTags.includes(tag));
  if (stepIndex === 1 && hasUrgent) return "If that doesn’t work tonight, try this next.";
  if (stepIndex === 1) return "Here’s a good backup option.";
  if (stepIndex === 2) return "Keep this one in your back pocket too.";
  return "You can also try this.";
}

function generateLeadAndDetail(resource: Resource, subTags: string[]): { lead: string; detail: string } {
  const leadParts: string[] = [];
  const detailParts: string[] = [];
  const is247 = isOpen247(resource.hours);
  const eligibility = resource.eligibility.toLowerCase();
  const verb = getActionVerb(resource);
  const realTimeOpen = getOpenStatus(parseHours(resource.hours)).isOpen;

  leadParts.push(`${verb} ${resource.title}.`);

  if (resource.resourceType === "emergency_shelter") {
    if (subTags.includes("tonight") && resource.availabilityType === "twenty_four_hours") {
      leadParts.push("This looks like a same-day shelter option with around-the-clock availability.");
    } else if (subTags.includes("tonight") && resource.availabilityType === "overnight") {
      leadParts.push("This looks most useful for tonight, especially near evening intake.");
    } else if (resource.availabilityType === "twenty_four_hours") {
      leadParts.push("They appear to keep shelter access available around the clock.");
    } else if (resource.availabilityType === "overnight") {
      leadParts.push("This looks like an overnight shelter option.");
    }

    if (resource.intakeType === "walk_in") {
      detailParts.push("You may be able to walk in without setting everything up ahead of time.");
    } else if (resource.intakeType === "call_first") {
      detailParts.push("Call first if you can. That can save you a trip if beds are full.");
    } else if (resource.intakeType === "referral") {
      detailParts.push("This one may require a referral or outside help to get placed.");
    }

    if (typeof resource.beds === "number") {
      detailParts.push(`The listing shows about ${resource.beds} beds.`);
    }

    if (resource.populationTags.includes("men")) {
      detailParts.push("This listing appears to be for men.");
    }
    if (resource.populationTags.includes("women")) {
      detailParts.push("This listing appears to be for women.");
    }
    if (resource.populationTags.includes("families")) {
      detailParts.push("This listing appears to work for families.");
    }
    if (resource.accessibilityTags.includes("wheelchair_accessible")) {
      detailParts.push("Wheelchair access is noted.");
    } else if (resource.accessibilityTags.includes("ground_floor")) {
      detailParts.push("Ground-floor access is noted.");
    }
  } else if (subTags.includes("tonight") && is247) {
    leadParts.push("They’re open right now. You can call any time, day or night.");
  } else if (subTags.includes("tonight") && !is247) {
    leadParts.push(realTimeOpen
      ? "They’re still open right now. Try calling before they close."
      : "They’re closed right now. Try first thing when they open.");
  } else if (subTags.includes("crisis") && is247) {
    leadParts.push("They’re available right now, any time of day or night.");
  } else if (subTags.includes("crisis")) {
    leadParts.push("They specialize in crisis support and can help right away.");
  } else if (subTags.includes("right-now") && is247) {
    leadParts.push("They’re open right now. You can reach them any time.");
  } else if (subTags.includes("right-now")) {
    leadParts.push(realTimeOpen
      ? "They’re open right now. Worth calling before they close."
      : "They’re closed right now. Check below for when they open.");
  } else if (is247) {
    leadParts.push("They’re open 24/7, so you can reach them whenever you’re ready.");
  }

  if (eligibility.includes("no documentation") || eligibility.includes("no eligibility") || eligibility.includes("open to all") || eligibility.includes("anyone")) {
    detailParts.push("No documents or ID needed. Just reach out.");
  } else {
    if (eligibility.includes("proof of income")) {
      detailParts.push("Bring proof of income if you have it, but call first to see what you need.");
    }
    if (eligibility.includes("income below") || eligibility.includes("income-eligible") || eligibility.includes("low-income")) {
      detailParts.push("They’ll ask about your income. Just an estimate is fine.");
    }
    if (eligibility.includes("referral")) {
      detailParts.push("You may need a referral. Ask about that when you call.");
    }
  }

  if (eligibility.includes("families with children")) {
    detailParts.push("Families with children are prioritized, so let them know if you have kids with you.");
  }
  if (eligibility.includes("18+") || eligibility.includes("adults")) {
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
    detailParts.push("They work with families and understand what you’re going through.");
  }

  return {
    lead: leadParts.join(" "),
    detail: detailParts.join(" "),
  };
}

export function generateCallScript(resource: Resource, subTags: string[]): string | null {
  if (!resource.contact.phone) return null;
  if (resource.callScript) return resource.callScript;

  if (resource.resourceType === "emergency_shelter") {
    if (resource.intakeType === "walk_in") {
      return "Say: Hi, I need a shelter bed tonight. Can I walk in, and what time should I come?";
    }
    if (resource.intakeType === "referral") {
      return "Say: Hi, I need shelter tonight. Do I need a referral, and what is the fastest way to get one?";
    }
    return "Say: Hi, I need a shelter bed tonight. Do you have space, and what is the intake process?";
  }

  const category = resource.categories[0];
  if (subTags.includes("tonight") || subTags.includes("crisis")) {
    return "Say: Hi, I need help right now. Can someone talk to me?";
  }
  switch (category) {
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
  const lowerHours = resource.hours.toLowerCase();
  const eligibility = resource.eligibility.toLowerCase();

  if (resource.resourceType === "emergency_shelter") {
    if (resource.intakeType === "call_first") {
      tips.push("If you can, call before heading over so you can ask about space and intake timing.");
    }
    if (resource.intakeType === "referral") {
      tips.push("Ask exactly who can make the referral and whether they ever accept self-referrals.");
    }
    if (resource.accessibilityTags.includes("wheelchair_accessible")) {
      tips.push("Tell them up front that wheelchair access matters so they can confirm the right entrance or floor.");
    }
    if (typeof resource.beds === "number" && resource.beds <= 25) {
      tips.push("Smaller-capacity shelters can fill quickly, so it helps to call as early as you can.");
    }
  }

  if (lowerHours.includes("mon") && lowerHours.includes("am")) {
    const match = resource.hours.match(/(\d{1,2}:\d{2}\s*AM)/i);
    if (match) {
      tips.push(`Try calling right when they open at ${match[1]}. That’s usually the best time to get through.`);
    }
  }
  if (lowerHours.includes("24/7") || lowerHours.includes("24-hour") || lowerHours.includes("24hr")) {
    tips.push("If you get a busy signal, try again in a few minutes. Early morning and late evening are often less busy.");
  }

  if (eligibility.includes("proof of income")) {
    tips.push("If you don’t have income documents, ask about self-declaration. Many places accept a written statement.");
  }
  if (eligibility.includes("referral")) {
    tips.push("Ask if they accept self-referrals. Sometimes you do not actually need one from another agency.");
  }
  if (eligibility.includes("income below") || eligibility.includes("income-eligible") || eligibility.includes("low-income")) {
    tips.push("When they ask about income, an estimate is fine. You do not need exact paperwork on the first call.");
  }

  if (resource.contact.phone) {
    tips.push("Ask for the intake department specifically. The general line can sometimes send you in circles.");
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
  const matchingTags = subTags.filter((tag) => resource.subTags.includes(tag));
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
