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
      <div className="w-full max-w-md mx-auto px-6 pt-12 pb-20">

        {/* Intro */}
        <motion.div className="text-center mb-6" {...stagger(0)}>
          <p className="text-lg font-semibold text-primary mb-3">
            {guidance.headline}
          </p>
          <p className="text-xl font-bold text-foreground leading-relaxed mb-2">
            {guidance.lead}
          </p>
          {guidance.detail && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {guidance.detail}
            </p>
          )}
        </motion.div>

        {/* Hours indicator */}
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
          nextLabel={nextLabel}
        />
      </div>
    </div>
  );
}
