import { FollowUpQuestion } from "@/types";

export const followUpQuestions: FollowUpQuestion[] = [
  {
    id: "housing-urgency",
    category: "Housing",
    question: "How urgent is your housing need?",
    options: [
      { label: "I need somewhere tonight", subTag: "tonight" },
      { label: "Within a few days", subTag: "short-term" },
      { label: "I'm looking for longer-term help", subTag: "long-term" },
    ],
  },
  {
    id: "housing-accessibility",
    category: "Housing",
    question: "Any accessibility needs?",
    options: [
      { label: "Ground floor / no stairs", subTag: "ground-floor" },
      { label: "Wheelchair accessible", subTag: "wheelchair" },
      { label: "No special needs", subTag: "no-accessibility" },
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
