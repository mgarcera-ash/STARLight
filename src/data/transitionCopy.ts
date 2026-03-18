interface TransitionLine {
  subTag: string;
  priority: number;
  message: string;
}

const transitionLines: TransitionLine[] = [
  { subTag: "crisis", priority: 1, message: "You're not alone. Let's get you help right now." },
  { subTag: "tonight", priority: 2, message: "Let's find you somewhere safe tonight." },
  { subTag: "right-now", priority: 3, message: "Let's get you something to eat right now." },
  { subTag: "mental-health", priority: 4, message: "Taking this step matters. Let's find the right support." },
  { subTag: "substance-use", priority: 5, message: "We're glad you're here. Let's find the right help." },
  { subTag: "wheelchair", priority: 6, message: "Let's find a place that works for you." },
  { subTag: "ground-floor", priority: 6, message: "Let's find a place that works for you." },
  { subTag: "immigration", priority: 7, message: "Let's connect you with someone who can help." },
  { subTag: "family", priority: 8, message: "That's a lot to carry. Let's find support." },
  { subTag: "short-term", priority: 9, message: "Let's find you some options." },
  { subTag: "long-term", priority: 9, message: "Let's find you some options." },
  { subTag: "this-week", priority: 10, message: "Let's find something that fits." },
  { subTag: "ongoing", priority: 10, message: "Let's find something that fits." },
];

const FALLBACK = "We're looking for the best options for you.";

export function getTransitionMessage(answers: Record<string, string>): string {
  const userTags = Object.values(answers).filter(Boolean);
  if (userTags.length === 0) return FALLBACK;

  const match = transitionLines
    .filter((line) => userTags.includes(line.subTag))
    .sort((a, b) => a.priority - b.priority)[0];

  return match?.message ?? FALLBACK;
}
