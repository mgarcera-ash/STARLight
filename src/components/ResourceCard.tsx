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

const categoryConfig: Record<string, { icon: React.ElementType; gradient: string; badge: string; iconWrap: string }> = {
  Housing: { icon: Home, gradient: "from-secondary/25 via-secondary/12 to-transparent", badge: "text-secondary", iconWrap: "bg-secondary/12 text-secondary" },
  Food: { icon: Utensils, gradient: "from-accent/25 via-accent/12 to-transparent", badge: "text-accent", iconWrap: "bg-accent/12 text-accent" },
  Healthcare: { icon: HeartPulse, gradient: "from-primary/25 via-primary/12 to-transparent", badge: "text-primary", iconWrap: "bg-primary/12 text-primary" },
  Legal: { icon: Scale, gradient: "from-star-purple/25 via-star-purple/12 to-transparent", badge: "text-star-purple", iconWrap: "bg-star-purple/12 text-star-purple" },
  Community: { icon: Users, gradient: "from-star-blue/25 via-star-blue/12 to-transparent", badge: "text-star-blue", iconWrap: "bg-star-blue/12 text-star-blue" },
  "Internal Programs": { icon: Building2, gradient: "from-star-gold/30 via-star-gold/14 to-transparent", badge: "text-amber-700", iconWrap: "bg-star-gold/18 text-amber-700" },
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
        "overflow-hidden rounded-3xl border-2 border-border/70 bg-card/95 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.22)] backdrop-blur-sm",
        isLarge && "shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)]"
      )}
    >
      <Link to={`/resource/${resource.id}`}>
        <div className={cn("relative overflow-hidden border-b border-border/60 bg-gradient-to-br", config.gradient, isLarge ? "min-h-[7.75rem] p-5" : "min-h-[6.5rem] p-4")}>
          <div className="absolute inset-x-0 top-0 h-24 bg-white/55 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", config.iconWrap, isLarge && "h-14 w-14")}>
              <IconComp className={cn(isLarge ? "h-7 w-7" : "h-6 w-6")} strokeWidth={1.8} />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span className={cn("rounded-full border border-border/60 bg-white/90 px-3 py-1 text-xs font-semibold", config.badge)}>
                {primaryCat}
              </span>
              {resource.featured && (
                <span className="rounded-full border border-star-gold/45 bg-star-gold/25 px-3 py-1 text-xs font-semibold text-amber-800">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className={cn("p-4", isLarge && "p-5")}>
        <Link to={`/resource/${resource.id}`}>
          <h3 className={cn(
            "mb-2 font-bold leading-snug text-foreground",
            isLarge ? "text-xl" : "text-base"
          )}>
            {resource.title}
          </h3>
        </Link>

        <div className="mb-4 flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm leading-relaxed">{resource.location}</span>
        </div>

        {fitBadges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {fitBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-2xl border-2 border-border/60 bg-muted/35 px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {hasPhone && (
            <a
              href={`tel:${resource.contact.phone}`}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-700 bg-emerald-600 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
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
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={(event) => event.stopPropagation()}
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
          {hasEmail && (
            <a
              href={`mailto:${resource.contact.email}`}
              className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-border/70 bg-card px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/45"
              onClick={(event) => event.stopPropagation()}
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-border/60 bg-muted/25 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          <span>More info</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
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
              <div className="mt-3 space-y-3 rounded-3xl border-2 border-border/60 bg-muted/20 p-4 text-sm">
                <p className="leading-relaxed text-muted-foreground">{resource.description}</p>

                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Eligibility</span>
                    <p className="mt-1 text-sm text-muted-foreground">{resource.eligibility}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Hours</span>
                    <p className="mt-1 text-sm text-muted-foreground">{resource.hours || "Call to confirm current hours."}</p>
                  </div>
                </div>

                {typeof resource.beds === "number" && (
                  <div className="flex items-start gap-2">
                    <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Capacity</span>
                      <p className="mt-1 text-sm text-muted-foreground">About {resource.beds} beds listed.</p>
                    </div>
                  </div>
                )}

                {(resource.intakeType || resource.accessibilityTags.length > 0) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {resource.intakeType && (
                      <div className="flex items-start gap-2 rounded-2xl border border-border/50 bg-card/70 p-3">
                        <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Intake</span>
                          <p className="mt-1 text-sm text-muted-foreground">{getIntakeLabel(resource)}</p>
                        </div>
                      </div>
                    )}
                    {resource.accessibilityTags.length > 0 && (
                      <div className="flex items-start gap-2 rounded-2xl border border-border/50 bg-card/70 p-3">
                        <Accessibility className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Access</span>
                          <p className="mt-1 text-sm capitalize text-muted-foreground">{resource.accessibilityTags.join(", ").replaceAll("_", " ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  to={`/resource/${resource.id}`}
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Info className="h-4 w-4" />
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
