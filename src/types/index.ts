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
}

export type NewResource = Omit<Resource, "id" | "status" | "createdAt">;

export interface FollowUpQuestion {
  id: string;
  category: Category;
  question: string;
  options: { label: string; subTag: string }[];
}
