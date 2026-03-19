export type Category =
  | "Housing"
  | "Food"
  | "Healthcare"
  | "Legal"
  | "Community"
  | "Internal Programs";

export interface Resource {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  tags: string[];
  subTags: string[];
  eligibility: string;
  hours: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location: string;
  coordinates?: { lat: number; lng: number };
  featured: boolean;
  urgency: 1 | 2 | 3;
  status: "approved" | "pending" | "returned";
  returnComment?: string;
  tips?: string[];
  callScript?: string;
  createdAt: string;
  domain?: string;
  resourceType?: string;
  populationTags: string[];
  accessibilityTags: string[];
  serviceTags: string[];
  availabilityType?: string;
  beds?: number;
  intakeType?: string;
  sourceDataset?: string;
  sourceRecordId?: string;
}

export type NewResource = Omit<Resource, "id" | "status" | "createdAt">;

export interface FollowUpQuestionOption {
  label: string;
  subTag: string;
  description?: string;
}

export interface FollowUpQuestion {
  id: string;
  category: Category;
  question: string;
  supportText?: string;
  options: FollowUpQuestionOption[];
}
