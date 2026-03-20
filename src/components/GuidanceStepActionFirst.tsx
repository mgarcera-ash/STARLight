import { motion } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";
import { stagger } from "./guidance/types";
import HoursIndicator from "@/components/HoursIndicator";
import ActionTiles from "./guidance/ActionTiles";
import GuidanceFooter from "./guidance/GuidanceFooter";
import InfoCarousel from "./guidance/InfoCarousel";

interface GuidanceStepActionFirstProps {
  resource: Resource;
  guidance: StepGuidance;
  subTags?: string[];
  onSkip?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

export default function GuidanceStepActionFirst({
  resource,
  guidance,
  subTags = [],
  onSkip,
  onNext,
  onBack,
  nextLabel,
  showBack,
}: GuidanceStepActionFirstProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);

  const shortContext = [
    resource.availabilityType === "twenty_four_hours" ? "24 hours" : null,
    resource.availabilityType === "overnight" ? "Overnight" : null,
    resource.populationTags.includes("men") ? "Men" : null,
    resource.populationTags.includes("women") ? "Women" : null,
    resource.populationTags.includes("families") ? "Families" : null,
    resource.populationTags.includes("single_adults") ? "Single adults" : null,
    resource.intakeType === "walk_in" ? "Walk in" : null,
    resource.intakeType === "call_first" ? "Call first" : null,
    resource.intakeType === "referral" ? "Referral needed" : null,
  ].filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-6 pt-12 pb-20">
        <motion.div className="mb-6 rounded-3xl border-2 border-border/70 bg-card/92 p-5 text-center shadow-[0_20px_60px_-32px_rgba(15,23,42,0.22)] backdrop-blur-sm" {...stagger(0)}>
          <p className="mb-2 text-lg font-semibold text-primary">{guidance.headline}</p>
          <p className="mb-3 text-2xl font-bold leading-tight text-foreground">{guidance.lead}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {shortContext.length > 0 ? shortContext.join(" • ") : resource.title}
          </p>
        </motion.div>

        <ActionTiles resource={resource} />

        <motion.div className="mb-6 flex justify-center" {...stagger(0.55)}>
          <HoursIndicator hours={resource.hours} />
        </motion.div>

        <InfoCarousel
          resource={resource}
          guidance={guidance}
          tips={tips}
          callScript={callScript}
          delay={0.9}
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
