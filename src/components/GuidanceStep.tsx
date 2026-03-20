import { motion } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";
import { stagger, isConfidentialLocation } from "./guidance/types";
import HoursIndicator from "@/components/HoursIndicator";
import ActionTiles from "./guidance/ActionTiles";
import CallScript from "./guidance/CallScript";
import LocationCard from "./guidance/LocationCard";
import GuidanceFooter from "./guidance/GuidanceFooter";

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

export default function GuidanceStep({ resource, guidance, subTags = [], onSkip, onNext, onBack, nextLabel, showBack }: GuidanceStepProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);
  const hasCoords = !!resource.coordinates;
  const hasLocation = !!resource.location && !isConfidentialLocation(resource.location);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-6 pt-12 pb-20">
        <motion.div className="mb-6 rounded-3xl border-2 border-border/70 bg-card/90 p-5 text-center shadow-[0_20px_60px_-32px_rgba(15,23,42,0.22)] backdrop-blur-sm" {...stagger(0)}>
          <p className="mb-3 text-lg font-semibold text-primary">
            {guidance.headline}
          </p>
          <p className="mb-3 text-2xl font-bold leading-tight text-foreground">
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
