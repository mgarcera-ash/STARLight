import { Link } from "react-router-dom";
import { Resource } from "@/types";
import { MapPin } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
  size?: "sm" | "lg";
}

const categoryColors: Record<string, string> = {
  Housing: "bg-secondary text-secondary-foreground",
  Food: "bg-accent text-accent-foreground",
  Healthcare: "bg-primary text-primary-foreground",
  Legal: "bg-[hsl(var(--star-purple-accent))] text-primary-foreground",
  Community: "bg-[hsl(var(--star-blue))] text-primary-foreground",
  "Internal Programs": "bg-[hsl(var(--star-gold))] text-accent-foreground",
};

export default function ResourceCard({ resource, size = "sm" }: ResourceCardProps) {
  const isLarge = size === "lg";

  return (
    <Link
      to={`/resource/${resource.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
        isLarge ? "min-w-[280px] p-5" : "min-w-[200px] p-4"
      )}
    >
      <div className="flex flex-wrap gap-1.5 mb-2">
        {resource.categories.slice(0, 2).map((cat) => (
          <span
            key={cat}
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              categoryColors[cat] || "bg-muted text-muted-foreground"
            )}
          >
            {cat}
          </span>
        ))}
      </div>

      <h3
        className={cn(
          "font-bold text-foreground leading-snug mb-1",
          isLarge ? "text-lg" : "text-sm"
        )}
      >
        {resource.title}
      </h3>

      <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
        {resource.description}
      </p>

      <div className="flex items-center gap-1 text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="text-[11px] truncate">{resource.location}</span>
      </div>
    </Link>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
