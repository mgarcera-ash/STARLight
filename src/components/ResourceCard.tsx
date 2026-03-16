import { useState } from "react";
import { Link } from "react-router-dom";
import { Resource } from "@/types";
import { MapPin, Home, Utensils, HeartPulse, Scale, Users, Building2, Phone, Navigation, Mail, ChevronDown, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ResourceCardProps {
  resource: Resource;
  size?: "sm" | "lg";
}

const categoryConfig: Record<string, { icon: React.ElementType; gradient: string }> = {
  Housing: { icon: Home, gradient: "from-secondary/90 to-secondary/60" },
  Food: { icon: Utensils, gradient: "from-accent/90 to-accent/60" },
  Healthcare: { icon: HeartPulse, gradient: "from-primary/90 to-primary/60" },
  Legal: { icon: Scale, gradient: "from-star-purple/90 to-star-purple/60" },
  Community: { icon: Users, gradient: "from-star-blue/90 to-star-blue/60" },
  "Internal Programs": { icon: Building2, gradient: "from-star-gold/90 to-star-gold/60" },
};

function getMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function ResourceCard({ resource, size = "sm", asDiv = false }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLarge = size === "lg";
  const primaryCat = resource.categories[0] || "Housing";
  const config = categoryConfig[primaryCat] || categoryConfig.Housing;
  const IconComp = config.icon;

  const hasPhone = !!resource.contact.phone;
  const hasEmail = !!resource.contact.email;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-md overflow-hidden",
        isLarge && "shadow-lg"
      )}
    >
      {/* Icon header - links to detail */}
      <Link to={`/resource/${resource.id}`}>
        <div
          className={cn(
            "relative flex items-center justify-center bg-gradient-to-br",
            config.gradient,
            isLarge ? "h-24" : "h-16"
          )}
        >
          <IconComp
            className={cn(
              "text-primary-foreground/30",
              isLarge ? "h-12 w-12" : "h-8 w-8"
            )}
            strokeWidth={1.2}
          />
          {resource.featured && (
            <span className="absolute top-2 right-2 rounded-full bg-star-gold px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm">
              ⭐ Featured
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className={cn("p-4", isLarge && "p-5")}>
        <Link to={`/resource/${resource.id}`}>
          <h3 className={cn(
            "font-bold text-foreground leading-snug mb-1",
            isLarge ? "text-lg" : "text-sm"
          )}>
            {resource.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="text-xs truncate">{resource.location}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-2">
          {hasPhone && (
            <a
              href={`tel:${resource.contact.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          <a
            href={getMapsUrl(resource.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
          {hasEmail && (
            <a
              href={`mailto:${resource.contact.email}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
        </div>

        {/* Expandable more info */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-180")} />
          More info
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">{resource.description}</p>

                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground text-xs">Eligibility</span>
                    <p className="text-xs text-muted-foreground">{resource.eligibility}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground text-xs">Hours</span>
                    <p className="text-xs text-muted-foreground">{resource.hours}</p>
                  </div>
                </div>

                <Link
                  to={`/resource/${resource.id}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Info className="h-3.5 w-3.5" />
                  Full details
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
