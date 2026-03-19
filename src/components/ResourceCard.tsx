import { useState } from "react";
import { Link } from "react-router-dom";
import { Resource } from "@/types";
import { MapPin, Home, Utensils, HeartPulse, Scale, Users, Building2, Phone, Navigation, Mail, ChevronDown, Clock, Info, Accessibility, BedDouble, PhoneCall } from "lucide-react";
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

function getPopulationLabel(resource: Resource) {
  if (resource.populationTags.includes("families")) return "Families";
  if (resource.populationTags.includes("youth")) return "Youth";
  if (resource.populationTags.includes("women")) return "Women";
  if (resource.populationTags.includes("men")) return "Men";
  if (resource.populationTags.includes("single_adults")) return "Single adults";
  return null;
}

function getAvailabilityLabel(resource: Resource) {
  if (resource.availabilityType === "twenty_four_hours") return "24 hours";
  if (resource.availabilityType === "overnight") return "Overnight";
  if (resource.availabilityType === "scheduled") return "Scheduled hours";
  return null;
}

function getIntakeLabel(resource: Resource) {
  if (resource.intakeType === "walk_in") return "Walk in";
  if (resource.intakeType === "call_first") return "Call first";
  if (resource.intakeType === "referral") return "Referral";
  return null;
}

function getFitBadges(resource: Resource) {
  const badges: string[] = [];
  const population = getPopulationLabel(resource);
  const availability = getAvailabilityLabel(resource);
  const intake = getIntakeLabel(resource);

  if (population) badges.push(population);
  if (availability) badges.push(availability);
  if (typeof resource.beds === "number") badges.push(`${resource.beds} beds`);
  if (resource.accessibilityTags.includes("wheelchair_accessible")) badges.push("Wheelchair access");
  else if (resource.accessibilityTags.includes("ground_floor")) badges.push("Ground floor");
  if (intake) badges.push(intake);

  return badges.slice(0, 4);
}

export default function ResourceCard({ resource, size = "sm" }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLarge = size === "lg";
  const primaryCat = resource.categories[0] || "Housing";
  const config = categoryConfig[primaryCat] || categoryConfig.Housing;
  const IconComp = config.icon;
  const fitBadges = getFitBadges(resource);

  const hasPhone = !!resource.contact.phone;
  const hasEmail = !!resource.contact.email;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-md",
        isLarge && "shadow-lg"
      )}
    >
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
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className={cn("p-4", isLarge && "p-5")}>
        <Link to={`/resource/${resource.id}`}>
          <h3 className={cn(
            "mb-1 font-bold leading-snug text-foreground",
            isLarge ? "text-lg" : "text-sm"
          )}>
            {resource.title}
          </h3>
        </Link>

        <div className="mb-3 flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate text-xs">{resource.location}</span>
        </div>

        {fitBadges.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {fitBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className="mb-2 flex gap-2">
          {hasPhone && (
            <a
              href={`tel:${resource.contact.phone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              onClick={(event) => event.stopPropagation()}
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          <a
            href={getMapsUrl(resource.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={(event) => event.stopPropagation()}
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
          {hasEmail && (
            <a
              href={`mailto:${resource.contact.email}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              onClick={(event) => event.stopPropagation()}
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
              <div className="space-y-3 pt-3 text-sm">
                <p className="leading-relaxed text-muted-foreground">{resource.description}</p>

                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="text-xs font-semibold text-foreground">Eligibility</span>
                    <p className="text-xs text-muted-foreground">{resource.eligibility}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="text-xs font-semibold text-foreground">Hours</span>
                    <p className="text-xs text-muted-foreground">{resource.hours || "Call to confirm current hours."}</p>
                  </div>
                </div>

                {typeof resource.beds === "number" && (
                  <div className="flex items-start gap-2">
                    <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Capacity</span>
                      <p className="text-xs text-muted-foreground">About {resource.beds} beds listed.</p>
                    </div>
                  </div>
                )}

                {(resource.intakeType || resource.accessibilityTags.length > 0) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {resource.intakeType && (
                      <div className="flex items-start gap-2">
                        <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <span className="text-xs font-semibold text-foreground">Intake</span>
                          <p className="text-xs text-muted-foreground">{getIntakeLabel(resource)}</p>
                        </div>
                      </div>
                    )}
                    {resource.accessibilityTags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Accessibility className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <span className="text-xs font-semibold text-foreground">Access</span>
                          <p className="text-xs text-muted-foreground">{resource.accessibilityTags.join(", ").replaceAll("_", " ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
