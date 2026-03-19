import { FollowUpQuestion } from "@/types";

export const followUpQuestions: FollowUpQuestion[] = [
  {
    id: "housing-timeline",
    category: "Housing",
    question: "What feels most urgent right now?",
    supportText: "A few quick questions will help us look for the safest fit, not just the closest match.",
    options: [
      {
        label: "I need somewhere to sleep tonight",
        subTag: "tonight",
        description: "Prioritize options that may work the same day.",
      },
      {
        label: "I need help within the next few days",
        subTag: "short-term",
        description: "Keep urgent shelter options in view, but a little less immediate.",
      },
      {
        label: "I'm planning ahead for housing",
        subTag: "long-term",
        description: "Useful when tonight is covered, but you still need stability.",
      },
    ],
  },
  {
    id: "housing-household",
    category: "Housing",
    question: "Who needs a place right now?",
    supportText: "This helps us avoid sending you somewhere that is set up for a different household.",
    options: [
      {
        label: "Just me",
        subTag: "single_adults",
        description: "Single-adult options first.",
      },
      {
        label: "Me and my child or children",
        subTag: "families",
        description: "Family-friendly housing and shelter options.",
      },
      {
        label: "I'm a young person and need youth options",
        subTag: "youth",
        description: "Youth-specific programs when available.",
      },
      {
        label: "More than one adult",
        subTag: "multiple_adults",
        description: "Keep flexible options visible, even if they are not a perfect fit.",
      },
    ],
  },
  {
    id: "housing-population",
    category: "Housing",
    question: "Which of these sounds most like your situation?",
    supportText: "You only need to share what feels useful. This is here to narrow out places that clearly would not fit.",
    options: [
      {
        label: "I'm an adult man",
        subTag: "men",
        description: "Show men's shelter options more confidently.",
      },
      {
        label: "I'm an adult woman",
        subTag: "women",
        description: "Avoid men-only placements when possible.",
      },
      {
        label: "I'm coming home from jail or prison, or on parole/probation",
        subTag: "returning_citizens",
        description: "Prioritize places that can work with reentry requirements.",
      },
      {
        label: "Prefer not to say",
        subTag: "prefer_not_to_say",
        description: "Keep options broader.",
      },
    ],
  },
  {
    id: "housing-access",
    category: "Housing",
    question: "Do stairs, elevators, or wheelchair access matter tonight?",
    supportText: "If access matters, we should treat that like a real need, not a nice-to-have.",
    options: [
      {
        label: "I need wheelchair access",
        subTag: "wheelchair_accessible",
        description: "Prefer wheelchair-accessible placements.",
      },
      {
        label: "I need ground floor or no stairs",
        subTag: "ground_floor",
        description: "Useful when stairs are a barrier even without a wheelchair.",
      },
      {
        label: "No specific access need",
        subTag: "no_accessibility",
        description: "Keep all options in play.",
      },
    ],
  },
  {
    id: "housing-intake",
    category: "Housing",
    question: "What kind of next step feels realistic for you?",
    supportText: "Some places want a walk-in, some want a call first, and some need a referral. We can lean toward what feels doable.",
    options: [
      {
        label: "I need someplace I can walk into",
        subTag: "walk_in",
        description: "Boost walk-in options.",
      },
      {
        label: "I can call first",
        subTag: "call_first",
        description: "Good if a phone call is manageable.",
      },
      {
        label: "Referral is okay if needed",
        subTag: "referral",
        description: "Include referral-based placements more confidently.",
      },
      {
        label: "I'm not sure yet",
        subTag: "unknown_intake",
        description: "Keep this broad and flexible.",
      },
    ],
  },
  {
    id: "food-urgency",
    category: "Food",
    question: "How soon do you need food?",
    options: [
      { label: "Right now, I'm hungry", subTag: "right-now" },
      { label: "This week", subTag: "this-week" },
      { label: "Ongoing assistance", subTag: "ongoing" },
    ],
  },
  {
    id: "healthcare-type",
    category: "Healthcare",
    question: "What kind of care do you need?",
    options: [
      { label: "I'm in crisis right now", subTag: "crisis" },
      { label: "I need to see a doctor", subTag: "primary-care" },
      { label: "Mental health support", subTag: "mental-health" },
      { label: "Substance use help", subTag: "substance-use" },
    ],
  },
  {
    id: "legal-type",
    category: "Legal",
    question: "What's the situation?",
    options: [
      { label: "Housing / eviction issue", subTag: "housing-legal" },
      { label: "Immigration", subTag: "immigration" },
      { label: "Family or domestic matter", subTag: "family" },
      { label: "Something else", subTag: "other-legal" },
    ],
  },
  {
    id: "community-type",
    category: "Community",
    question: "What would help most?",
    options: [
      { label: "Activities for my kids", subTag: "youth" },
      { label: "Job or training help", subTag: "workforce" },
      { label: "Someone to talk to", subTag: "social" },
      { label: "Clothing or supplies", subTag: "supplies" },
    ],
  },
];

export function getQuestionsForCategories(categories: string[]): FollowUpQuestion[] {
  return followUpQuestions.filter((q) => categories.includes(q.category));
}
