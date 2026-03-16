import { Link } from "react-router-dom";
import { Resource } from "@/types";
import { MapPin, Home, Utensils, HeartPulse, Scale, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: Resource;
  size?: "sm" | "lg";
}

const categoryConfig: Record<string, { icon: React.ElementType; gradient: string; badge: string }> = {
  Housing: {
    icon: Home,
    gradient: "from-secondary/90 to-secondary/60",
    badge: "bg-secondary text-secondary-foreground",
  },
  Food: {
    icon: Utensils,
    gradient: "from-accent/90 to-accent/60",
    badge: "bg-accent text-accent-foreground",
  },
  Healthcare: {
    icon: HeartPulse,
    gradient: "from-primary/90 to-primary/60",
    badge: "bg-primary text-primary-foreground",
  },
  Legal: {
    icon: Scale,
    gradient: "from-star-purple/90 to-star-purple/60",
    badge: "bg-star-purple text-primary-foreground",
  },
  Community: {
    icon: Users,
    gradient: "from-star-blue/90 to-star-blue/60",
    badge: "bg-star-blue text-primary-foreground",
  },
  "Internal Programs": {
    icon: Building2,
    gradient: "from-star-gold/90 to-star-gold/60",
    badge: "bg-star-gold text-foreground",
  },
};

export default function ResourceCard({ resource, size = "sm" }: ResourceCardProps) {
  const isLarge = size === "lg";
  const primaryCat = resource.categories[0] || "Housing";
  const config = categoryConfig[primaryCat] || categoryConfig.Housing;
  const IconComp = config.icon;

  return (
    <Link
      to={`/resource/${resource.id}`}
      className={cn(
        "group block rounded-2xl border border-border bg-card shadow-md transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden",
        isLarge ? "min-w-[280px]" : "min-w-[200px]"
      )}
    >
      {/* Icon illustration zone */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br",
          config.gradient,
          isLarge ? "h-32" : "h-24"
        )}
      >
        <IconComp
          className={cn(
            "text-primary-foreground/30",
            isLarge ? "h-16 w-16" : "h-12 w-12"
          )}
          strokeWidth={1.2}
        />
        {resource.featured && (
          <span className="absolute top-2 right-2 rounded-full bg-star-gold px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className={cn("p-4", isLarge && "p-5")}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {resource.categories.slice(0, 2).map((cat) => {
            const c = categoryConfig[cat];
            return (
              <span
                key={cat}
                className={cn(
                  "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  c?.badge || "bg-muted text-muted-foreground"
                )}
              >
                {cat}
              </span>
            );
          })}
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
      </div>
    </Link>
  );
}
