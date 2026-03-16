import { useRef } from "react";
import { Resource } from "@/types";
import ResourceCard from "./ResourceCard";
import { ChevronRight, Home, Utensils, HeartPulse, Scale, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryRowProps {
  title: string;
  resources: Resource[];
}

const catAccent: Record<string, string> = {
  Housing: "border-secondary",
  Food: "border-accent",
  Healthcare: "border-primary",
  Legal: "border-star-purple",
  Community: "border-star-blue",
  "Internal Programs": "border-star-gold",
};

export default function CategoryRow({ title, resources }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (resources.length === 0) return null;

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" });
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className={cn(
          "text-base font-bold text-foreground border-l-4 pl-2",
          catAccent[title] || "border-primary"
        )}>
          {title}
        </h2>
        {resources.length > 2 && (
          <button
            onClick={scrollRight}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {resources.map((r) => (
          <div key={r.id} style={{ scrollSnapAlign: "start" }}>
            <ResourceCard resource={r} />
          </div>
        ))}
      </div>
    </section>
  );
}
