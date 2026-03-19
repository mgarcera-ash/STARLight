import { useState } from "react";
import { Resource } from "@/types";
import { Clock, MapPin, Users, Phone, Navigation, Mail, ChevronDown, Accessibility, BedDouble, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function getMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function getMapsEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
}

function getPopulationSummary(resource: Resource) {
  const labels: string[] = [];
  if (resource.populationTags.includes("men")) labels.push("Men");
  if (resource.populationTags.includes("women")) labels.push("Women");
  if (resource.populationTags.includes("families")) labels.push("Families");
  if (resource.populationTags.includes("youth")) labels.push("Youth");
  if (resource.populationTags.includes("single_adults")) labels.push("Single adults");
  return labels.join(" • ");
}

function getAvailabilityLabel(resource: Resource) {
  if (resource.availabilityType === "twenty_four_hours") return "24 hours";
  if (resource.availabilityType === "overnight") return "Overnight";
  if (resource.availabilityType === "scheduled") return "Scheduled hours";
  return undefined;
}

function getIntakeLabel(resource: Resource) {
  if (resource.intakeType === "walk_in") return "Walk in";
  if (resource.intakeType === "call_first") return "Call first";
  if (resource.intakeType === "referral") return "Referral";
  return undefined;
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-foreground"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-3 text-sm text-muted-foreground">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResourceInfo({ resource }: { resource: Resource }) {
  const hasPhone = !!resource.contact.phone;
  const hasEmail = !!resource.contact.email;
  const populationSummary = getPopulationSummary(resource);
  const availabilityLabel = getAvailabilityLabel(resource);
  const intakeLabel = getIntakeLabel(resource);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        {hasPhone && (
          <a
            href={`tel:${resource.contact.phone}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-base font-bold text-white hover:bg-green-700 transition-colors"
          >
            <Phone className="h-5 w-5" />
            Call Now: {resource.contact.phone}
          </a>
        )}
        <a
          href={getMapsUrl(resource.location)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Navigation className="h-5 w-5" />
          Get Directions
        </a>
        {hasEmail && (
          <a
            href={`mailto:${resource.contact.email}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3.5 text-base font-bold text-foreground hover:bg-muted transition-colors"
          >
            <Mail className="h-5 w-5" />
            Send Email
          </a>
        )}
      </div>

      {(populationSummary || availabilityLabel || intakeLabel || typeof resource.beds === "number" || resource.accessibilityTags.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">What to know before you go</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {populationSummary && (
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Best fit
                </div>
                <p className="text-sm text-muted-foreground">{populationSummary}</p>
              </div>
            )}
            {availabilityLabel && (
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Availability
                </div>
                <p className="text-sm text-muted-foreground">{availabilityLabel}</p>
              </div>
            )}
            {intakeLabel && (
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <PhoneCall className="h-4 w-4 text-primary" />
                  Intake
                </div>
                <p className="text-sm text-muted-foreground">{intakeLabel}</p>
              </div>
            )}
            {typeof resource.beds === "number" && (
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <BedDouble className="h-4 w-4 text-primary" />
                  Capacity listed
                </div>
                <p className="text-sm text-muted-foreground">About {resource.beds} beds</p>
              </div>
            )}
            {resource.accessibilityTags.length > 0 && (
              <div className="rounded-xl bg-muted/60 p-3 sm:col-span-2">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Accessibility className="h-4 w-4 text-primary" />
                  Accessibility
                </div>
                <p className="text-sm text-muted-foreground">
                  {resource.accessibilityTags.map((tag) => tag.replaceAll("_", " ")).join(" • ")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <iframe
          title="Location map"
          src={getMapsEmbedUrl(resource.location)}
          className="w-full h-48"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="flex items-center gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {resource.location}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden px-4">
        <CollapsibleSection title="Hours" icon={Clock}>
          {resource.hours || "Call to confirm current hours and intake timing."}
        </CollapsibleSection>
        <CollapsibleSection title="Eligibility" icon={Users}>
          {resource.eligibility}
        </CollapsibleSection>
        <CollapsibleSection title="About this resource" icon={MapPin}>
          <p className="leading-relaxed">{resource.description}</p>
        </CollapsibleSection>
      </div>
    </div>
  );
}
