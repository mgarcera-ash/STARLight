import { Resource } from "@/types";
import { StepGuidance } from "@/data/guidanceCopy";
import GuidanceStepSplit from "./GuidanceStepSplit";

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

export default function GuidanceStep({
  resource,
  guidance,
  subTags = [],
  onSkip,
  onNext,
  onBack,
  nextLabel,
  showBack,
}: GuidanceStepProps) {
  return (
    <GuidanceStepSplit
      resource={resource}
      guidance={guidance}
      subTags={subTags}
      onSkip={onSkip}
      onNext={onNext}
      onBack={onBack}
      nextLabel={nextLabel}
      showBack={showBack}
    />
  );
}
