import { motion } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";
import { stagger, isConfidentialLocation } from "./guidance/types";
import HoursIndicator from "@/components/HoursIndicator";
import ActionTiles from "./guidance/ActionTiles";
import CallScript from "./guidance/CallScript";
import LocationCard from "./guidance/LocationCard";
import GuidanceFooter from "./guidance/GuidanceFooter";
import { Accessibility, BedDouble, Clock3, PhoneCall, Users } from "lucide-react";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
  subTags?: string[];
  onSkip?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

function getPopulationSummary(resource: Resource) {
  const labels: string[] = [];
  if (resource.populationTags.includes("men")) labels.push("Men");
  if (resource.populationTags.includes("women")) labels.push("Women");
  if (resource.populationTags.includes("families")) labels.push("Families");
  if (resource.populationTags.includes("youth")) labels.push("Youth");
  if (resource.populationTags.includes("single_adults")) labels.push("Single adults");
  if (resource.populationTags.includes("returning_citizens")) labels.push("Returning citizens");
  return labels.join(" • ");
}

function getAvailabilityLabel(resource: Resource) {
  if (resource.availabilityType === "twenty_four_hours") return "24 hours";
  if (resource.availabilityType === "overnight") return "Overnight";
  if (resource.availabilityType === "scheduled") return "Scheduled hours";
  return resource.hours || null;
}

function getIntakeLabel(resource: Resource) {
  if (resource.intakeType === "walk_in") return "Walk in";
  if (resource.intakeType === "call_first") return "Call first";
  if (resource.intakeType === "referral") return "Referral";
  return null;
}

function getAccessibilitySummary(resource: Resource) {
  if (resource.accessibilityTags.length === 0) return null;
  return resource.accessibilityTags.map((tag) => tag.replaceAll("_", " ")).join(" • ");
}

function buildFitFacts(resource: Resource) {
  const facts = [
    {
      key: "fit",
      icon: Users,
      label: "Best fit",
      value: getPopulationSummary(resource),
    },
    {
      key: "availability",
      icon: Clock3,
      label: "Availability",
      value: getAvailabilityLabel(resource),
    },
    {
      key: "intake",
      icon: PhoneCall,
      label: "Intake",
      value: getIntakeLabel(resource),
    },
    {
      key: "beds",
      icon: BedDouble,
      label: "Capacity",
      value: typeof resource.beds === "number" ? `About ${resource.beds} beds` : null,
    },
    {
      key: "access",
      icon: Accessibility,
      label: "Accessibility",
      value: getAccessibilitySummary(resource),
    },
  ];

  return facts.filter((fact) => fact.value);
}

export default function GuidanceStep({ resource, guidance, subTags = [], onSkip, onNext, onBack, nextLabel, showBack }: GuidanceStepProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);
  const hasCoords = !!resource.coordinates;
  const hasLocation = !!resource.location && !isConfidentialLocation(resource.location);
  const fitFacts = buildFitFacts(resource);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-6 pt-12 pb-20">
        <motion.div className="mb-6 text-center" {...stagger(0)}>
          <p className="mb-3 text-lg font-semibold text-primary">
            {guidance.headline}
          </p>
          <p className="mb-2 text-xl font-bold leading-relaxed text-foreground">
            {guidance.lead}
          </p>
          {guidance.detail && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {guidance.detail}
            </p>
          )}
        </motion.div>

        <motion.div className="mb-6 flex justify-center" {...stagger(0.4)}>
          <HoursIndicator hours={resource.hours} />
        </motion.div>

        {fitFacts.length > 0 && (
          <motion.div
            className="mb-6 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm"
            {...stagger(0.55)}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              Why this may fit
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {fitFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.key} className="rounded-2xl bg-muted/60 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {fact.label}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{fact.value}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <ActionTiles resource={resource} />
        {callScript && <CallScript script={callScript} />}
        {hasLocation && <LocationCard location={resource.location} hasCoords={hasCoords} />}

        <GuidanceFooter
          tips={tips}
          onSkip={onSkip}
          onNext={onNext}
          onBack={onBack}
          nextLabel={nextLabel}
          showBack={showBack}
        />
      </div>
    </div>
  );
}
