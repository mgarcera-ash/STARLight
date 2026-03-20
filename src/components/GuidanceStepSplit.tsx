import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";
import { stagger } from "./guidance/types";
import HoursIndicator from "@/components/HoursIndicator";
import GuidanceFooter from "./guidance/GuidanceFooter";
import InfoCarousel from "./guidance/InfoCarousel";
import LocationCard from "./guidance/LocationCard";

interface GuidanceStepSplitProps {
  resource: Resource;
  guidance: StepGuidance;
  subTags?: string[];
  onSkip?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

export default function GuidanceStepSplit({
  resource,
  guidance,
  subTags = [],
  onSkip,
  onNext,
  onBack,
  nextLabel,
  showBack,
}: GuidanceStepSplitProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);

  const summaryBits = [
    resource.populationTags.includes("men") ? "Men" : null,
    resource.populationTags.includes("women") ? "Women" : null,
    resource.populationTags.includes("families") ? "Families" : null,
    resource.populationTags.includes("single_adults") ? "Single adults" : null,
    resource.availabilityType === "twenty_four_hours" ? "24 hours" : null,
    resource.availabilityType === "overnight" ? "Overnight" : null,
    resource.intakeType === "walk_in" ? "Walk in" : null,
    resource.intakeType === "call_first" ? "Call first" : null,
    resource.intakeType === "referral" ? "Referral needed" : null,
  ].filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-6 pt-12 pb-20">
        <motion.div className="mb-6 rounded-3xl border-2 border-border/70 bg-card/90 p-5 text-center shadow-[0_20px_60px_-32px_rgba(15,23,42,0.22)] backdrop-blur-sm" {...stagger(0)}>
          <p className="mb-3 text-lg font-semibold text-primary">{guidance.headline}</p>
          <p className="mb-3 text-2xl font-bold leading-tight text-foreground">{resource.title}</p>
          {summaryBits.length > 0 && (
            <p className="mb-5 text-sm font-semibold leading-relaxed text-muted-foreground">
              {summaryBits.join(" • ")}
            </p>
          )}
          {resource.contact.phone && (
            <div className="flex justify-center">
              <a
                href={`tel:${resource.contact.phone}`}
                className="relative flex aspect-square w-28 flex-none flex-col items-center justify-center overflow-hidden rounded-full border border-star-blue/90 bg-star-blue text-primary-foreground shadow-[0_16px_36px_-18px_rgba(37,99,235,0.65)] transition-opacity active:scale-[0.97] animate-soft-pulse"
              >
                <div className="relative z-10 flex flex-col items-center gap-1.5 p-4">
                  <Phone className="h-6 w-6 text-white" />
                  <span className="text-center text-xs font-semibold leading-tight text-primary-foreground">Tap to call</span>
                </div>
              </a>
            </div>
          )}
        </motion.div>

        <motion.div className="mb-6 flex justify-center" {...stagger(0.35)}>
          <HoursIndicator hours={resource.hours} />
        </motion.div>

        {resource.location && (
          <LocationCard
            location={resource.location}
            hasCoords={!!resource.coordinates}
            delay={0.7}
          />
        )}

        <InfoCarousel
          resource={resource}
          guidance={guidance}
          tips={tips}
          callScript={callScript}
        />

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
