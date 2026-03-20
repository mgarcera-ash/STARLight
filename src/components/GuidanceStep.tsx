import { Resource } from "@/types";
import { StepGuidance } from "@/data/guidanceCopy";
import GuidanceStepSplit from "./GuidanceStepSplit";
import GuidanceStepActionFirst from "./GuidanceStepActionFirst";

export type GuidanceStepVariant = "split" | "action-first";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
  subTags?: string[];
  onSkip?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  variant?: GuidanceStepVariant;
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
  variant = "split",
}: GuidanceStepProps) {
  if (variant === "action-first") {
    return (
      <GuidanceStepActionFirst
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
