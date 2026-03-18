import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { useResources } from "@/context/ResourceContext";
import { generateStepGuidance } from "@/data/guidanceCopy";
import GuidanceStep from "@/components/GuidanceStep";
import ResourceCard from "@/components/ResourceCard";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TriageResultsProps {
  needs: Category[];
  followUpAnswers: Record<string, string>;
  onBack: () => void;
}

const MAX_GUIDED_STEPS = 3;

const startOverMessages = [
  "That's okay. Let's try again together.",
  "No worries. We're here whenever you're ready.",
  "Take your time. Let's start fresh.",
];

function getStartOverMessage() {
  return startOverMessages[Math.floor(Math.random() * startOverMessages.length)];
}

export default function TriageResults({ needs, followUpAnswers, onBack }: TriageResultsProps) {
  const { approvedResources } = useResources();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage] = useState(getStartOverMessage);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());

  const answerSubTags = useMemo(
    () => Object.values(followUpAnswers).filter(Boolean),
    [followUpAnswers]
  );

  const { guidedResources, remainingResources } = useMemo(() => {
    const matched = approvedResources.filter((r) =>
      r.categories.some((c) => needs.includes(c))
    );

    if (answerSubTags.length === 0) {
      const sorted = [...matched].sort((a, b) => a.urgency - b.urgency);
      return {
        guidedResources: sorted.slice(0, MAX_GUIDED_STEPS),
        remainingResources: sorted.slice(MAX_GUIDED_STEPS),
      };
    }

    const best: typeof matched = [];
    const other: typeof matched = [];

    for (const r of matched) {
      const matchCount = answerSubTags.filter((tag) => r.subTags.includes(tag)).length;
      if (matchCount > 0) {
        best.push(r);
      } else {
        other.push(r);
      }
    }

    best.sort((a, b) => {
      const aCount = answerSubTags.filter((t) => a.subTags.includes(t)).length;
      const bCount = answerSubTags.filter((t) => b.subTags.includes(t)).length;
      if (bCount !== aCount) return bCount - aCount;
      return a.urgency - b.urgency;
    });

    other.sort((a, b) => a.urgency - b.urgency);

    const all = [...best, ...other];
    return {
      guidedResources: all.slice(0, MAX_GUIDED_STEPS),
      remainingResources: all.slice(MAX_GUIDED_STEPS),
    };
  }, [approvedResources, needs, answerSubTags]);

  const total = guidedResources.length;
  const isOnFinalPage = currentStep >= total;
  const hasSkips = skippedSteps.size > 0;

  const handleBack = () => {
    if (currentStep === 0) {
      setShowConfirm(true);
    } else {
      setDirection(-1);
      setCurrentStep((i) => i - 1);
    }
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((i) => i + 1);
  };

  const handleSkip = () => {
    setSkippedSteps((prev) => new Set(prev).add(currentStep));
    handleNext();
  };

  // Confirmation screen
  if (showConfirm) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <motion.p
          className="text-lg font-semibold text-primary mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Are you sure?
        </motion.p>

        <motion.p
          className="text-xl font-bold text-foreground text-center leading-relaxed max-w-[280px] mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {confirmMessage}
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 w-full max-w-[280px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <Button onClick={onBack} className="w-full rounded-xl">
            Yes, start over
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowConfirm(false)}
            className="w-full rounded-xl text-muted-foreground"
          >
            Never mind, go back
          </Button>
        </motion.div>
      </div>
    );
  }

  // Final summary page
  if (isOnFinalPage) {
    const summaryHeadline = hasSkips
      ? "We noticed some of those didn't fit."
      : "That's your plan.";
    const summaryBody = hasSkips
      ? "That's okay — here are more options that might work better."
      : "You can come back any time. We're not going anywhere.";

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <motion.p
          className="text-lg font-semibold text-primary mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {summaryHeadline}
        </motion.p>

        <motion.p
          className="text-xl font-bold text-foreground text-center leading-relaxed max-w-[280px] mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {summaryBody}
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 w-full max-w-[300px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          {remainingResources.length > 0 && (
            <>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setShowAllOptions(!showAllOptions)}
              >
                <ChevronDown
                  className={`h-4 w-4 mr-1.5 transition-transform duration-200 ${showAllOptions ? "rotate-180" : ""}`}
                />
                {showAllOptions ? "Hide other options" : `See all options (${remainingResources.length} more)`}
              </Button>

              <AnimatePresence>
                {showAllOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 mt-2">
                      {remainingResources.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        >
                          <ResourceCard resource={r} size="sm" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <Button
            variant="ghost"
            onClick={() => setShowConfirm(true)}
            className="w-full rounded-xl text-muted-foreground"
          >
            Start over
          </Button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (total === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <motion.p
          className="text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No resources match your selection right now.
        </motion.p>
        <Button onClick={onBack} variant="outline">
          Try different needs
        </Button>
      </div>
    );
  }

  // Paginated guided steps
  const resource = guidedResources[currentStep];
  const guidance = generateStepGuidance(resource, answerSubTags, currentStep);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-6">
        <motion.button
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 flex flex-col"
        >
          <GuidanceStep resource={resource} guidance={guidance} onSkip={handleSkip} />

          <button
            onClick={handleNext}
            className="pb-8 pt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors self-center"
          >
            {currentStep + 1 < total ? "Next step" : "See summary"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
