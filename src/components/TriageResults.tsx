import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Resource } from "@/types";
import { useResources } from "@/context/ResourceContext";
import { generateStepGuidance } from "@/data/guidanceCopy";
import GuidanceStep, { GuidanceStepVariant } from "@/components/GuidanceStep";
import ResourceCard from "@/components/ResourceCard";
import { parseHours, getOpenStatus } from "@/components/HoursIndicator";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TriageResultsProps {
  needs: Category[];
  followUpAnswers: Record<string, string>;
  onBack: () => void;
}

const MAX_GUIDED_STEPS = 3;
const HOUSING = "Housing";
const HOUSING_QUESTION_IDS = {
  timeline: "housing-timeline",
  household: "housing-household",
  population: "housing-population",
  access: "housing-access",
  intake: "housing-intake",
} as const;

const startOverMessages = [
  "That's okay. Let's try again together.",
  "No worries. We're here whenever you're ready.",
  "Take your time. Let's start fresh.",
];

function getStartOverMessage() {
  return startOverMessages[Math.floor(Math.random() * startOverMessages.length)];
}

function getOpenPriority(resource: Resource) {
  return getOpenStatus(parseHours(resource.hours)).isOpen ? 0 : 1;
}

function compareDefault(a: Resource, b: Resource) {
  const openDelta = getOpenPriority(a) - getOpenPriority(b);
  if (openDelta !== 0) return openDelta;
  return a.urgency - b.urgency || a.title.localeCompare(b.title);
}

function includesAny(values: string[], targets: string[]) {
  return targets.some((target) => values.includes(target));
}

function getHousingAnswers(followUpAnswers: Record<string, string>) {
  return {
    timeline: followUpAnswers[HOUSING_QUESTION_IDS.timeline],
    household: followUpAnswers[HOUSING_QUESTION_IDS.household],
    population: followUpAnswers[HOUSING_QUESTION_IDS.population],
    access: followUpAnswers[HOUSING_QUESTION_IDS.access],
    intake: followUpAnswers[HOUSING_QUESTION_IDS.intake],
  };
}

function isHousingHardMismatch(resource: Resource, followUpAnswers: Record<string, string>) {
  const { household, population } = getHousingAnswers(followUpAnswers);
  const populations = resource.populationTags;

  if (populations.length === 0) {
    return false;
  }

  if (household === "families" && !populations.includes("families")) {
    return true;
  }

  if (household === "youth" && !populations.includes("youth")) {
    return true;
  }

  if (population === "men" && !populations.includes("men") && includesAny(populations, ["women", "families", "youth"])) {
    return true;
  }

  if (population === "women" && !populations.includes("women") && includesAny(populations, ["men", "families", "youth"])) {
    return true;
  }

  return false;
}

function getHousingScore(resource: Resource, followUpAnswers: Record<string, string>) {
  const { timeline, household, population, access, intake } = getHousingAnswers(followUpAnswers);
  let score = 0;

  if (resource.domain === "housing") score += 10;
  if (resource.resourceType === "emergency_shelter") score += 4;
  if (resource.featured) score += 1;
  score += Math.max(0, 4 - resource.urgency);

  if (timeline === "tonight") {
    if (resource.availabilityType === "twenty_four_hours") score += 9;
    else if (resource.availabilityType === "overnight") score += 7;
    else if (resource.hours) score += 3;
  } else if (timeline === "short-term") {
    if (includesAny(resource.subTags, ["short-term", "tonight"])) score += 4;
    if (resource.availabilityType === "twenty_four_hours" || resource.availabilityType === "overnight") score += 2;
  } else if (timeline === "long-term") {
    if (resource.resourceType === "emergency_shelter") score -= 2;
  }

  if (household === "single_adults") {
    if (resource.populationTags.includes("single_adults")) score += 6;
  } else if (household === "families") {
    if (resource.populationTags.includes("families")) score += 10;
  } else if (household === "youth") {
    if (resource.populationTags.includes("youth")) score += 10;
  }

  if (population === "men") {
    if (resource.populationTags.includes("men")) score += 9;
  } else if (population === "women") {
    if (resource.populationTags.includes("women")) score += 9;
  } else if (population === "returning_citizens") {
    if (includesAny(resource.serviceTags, ["returning_citizens"]) || resource.populationTags.includes("returning_citizens")) {
      score += 8;
    }
  }

  if (access === "wheelchair_accessible") {
    if (resource.accessibilityTags.includes("wheelchair_accessible")) score += 10;
    else score -= 7;
  } else if (access === "ground_floor") {
    if (includesAny(resource.accessibilityTags, ["ground_floor", "wheelchair_accessible"])) score += 7;
    else score -= 3;
  }

  if (intake === "walk_in") {
    if (resource.intakeType === "walk_in") score += 8;
    else if (resource.intakeType === "call_first") score += 3;
    else if (resource.intakeType === "referral") score -= 4;
  } else if (intake === "call_first") {
    if (resource.intakeType === "call_first") score += 7;
    else if (resource.intakeType === "walk_in") score += 4;
    else if (resource.intakeType === "referral") score -= 2;
  } else if (intake === "referral") {
    if (resource.intakeType === "referral") score += 7;
    else if (resource.intakeType === "call_first") score += 2;
  }

  if (typeof resource.beds === "number") {
    score += Math.min(3, Math.floor(resource.beds / 50));
  }

  return score;
}

function getMatchedResources(
  approvedResources: Resource[],
  needs: Category[],
  followUpAnswers: Record<string, string>,
  answerSubTags: string[]
) {
  const matched = approvedResources.filter((resource) =>
    resource.categories.some((category) => needs.includes(category))
  );

  if (!needs.includes(HOUSING)) {
    if (answerSubTags.length === 0) {
      const sorted = [...matched].sort(compareDefault);
      return {
        guidedResources: sorted.slice(0, MAX_GUIDED_STEPS),
        remainingResources: sorted.slice(MAX_GUIDED_STEPS),
      };
    }

    const best: Resource[] = [];
    const other: Resource[] = [];

    for (const resource of matched) {
      const matchCount = answerSubTags.filter((tag) => resource.subTags.includes(tag)).length;
      if (matchCount > 0) {
        best.push(resource);
      } else {
        other.push(resource);
      }
    }

    best.sort((a, b) => {
      const openDelta = getOpenPriority(a) - getOpenPriority(b);
      if (openDelta !== 0) return openDelta;
      const aCount = answerSubTags.filter((tag) => a.subTags.includes(tag)).length;
      const bCount = answerSubTags.filter((tag) => b.subTags.includes(tag)).length;
      if (bCount !== aCount) return bCount - aCount;
      return a.urgency - b.urgency || a.title.localeCompare(b.title);
    });

    other.sort(compareDefault);

    const all = [...best, ...other];
    return {
      guidedResources: all.slice(0, MAX_GUIDED_STEPS),
      remainingResources: all.slice(MAX_GUIDED_STEPS),
    };
  }

  const eligible = matched.filter((resource) => !isHousingHardMismatch(resource, followUpAnswers));
  const ranked = [...eligible].sort((a, b) => {
    const scoreDelta = getHousingScore(b, followUpAnswers) - getHousingScore(a, followUpAnswers);
    if (scoreDelta !== 0) return scoreDelta;

    const openDelta = getOpenPriority(a) - getOpenPriority(b);
    if (openDelta !== 0) return openDelta;

    const aBeds = a.beds ?? -1;
    const bBeds = b.beds ?? -1;
    if (bBeds !== aBeds) return bBeds - aBeds;

    return a.urgency - b.urgency || a.title.localeCompare(b.title);
  });

  return {
    guidedResources: ranked.slice(0, MAX_GUIDED_STEPS),
    remainingResources: ranked.slice(MAX_GUIDED_STEPS),
  };
}

export default function TriageResults({ needs, followUpAnswers, onBack }: TriageResultsProps) {
  const { approvedResources } = useResources();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage] = useState(getStartOverMessage);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [guidanceVariant, setGuidanceVariant] = useState<GuidanceStepVariant>("split");

  const answerSubTags = useMemo(
    () => Object.values(followUpAnswers).filter(Boolean),
    [followUpAnswers]
  );

  const { guidedResources, remainingResources } = useMemo(
    () => getMatchedResources(approvedResources, needs, followUpAnswers, answerSubTags),
    [approvedResources, needs, followUpAnswers, answerSubTags]
  );

  const total = guidedResources.length;
  const isOnFinalPage = currentStep >= total;
  const hasSkips = skippedSteps.size > 0;

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((i) => i - 1);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((i) => i + 1);
  };

  const handleSkip = () => {
    setSkippedSteps((prev) => new Set(prev).add(currentStep));
    handleNext();
  };

  if (showConfirm) {
    return (
      <div className="page-ambient-warm relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-[-4rem] h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-5rem] h-80 w-80 rounded-full bg-violet-500/16 blur-3xl" />
        </div>

        <motion.p
          className="relative z-10 text-lg font-semibold text-primary mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Are you sure?
        </motion.p>

        <motion.p
          className="relative z-10 text-xl font-bold text-foreground text-center leading-relaxed max-w-[280px] mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {confirmMessage}
        </motion.p>

        <motion.div
          className="relative z-10 flex flex-col gap-3 w-full max-w-[280px]"
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

  if (isOnFinalPage) {
    const summaryHeadline = hasSkips
      ? "We noticed some of those didn't fit."
      : "That's your plan.";
    const summaryBody = hasSkips
      ? "That's okay. Here are more options that might work better."
      : "You can come back any time. We're not going anywhere.";

    const goToStep = (step: number) => {
      setDirection(-1);
      setCurrentStep(step);
    };

    return (
      <div className="page-ambient relative min-h-screen overflow-hidden px-6 pt-12 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-[-4rem] h-72 w-72 rounded-full bg-primary/22 blur-3xl" />
          <div className="absolute top-40 right-[-5rem] h-80 w-80 rounded-full bg-star-blue/15 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/11 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <motion.div
            className="mb-8 flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {guidedResources.map((resource, index) => {
              const wasSkipped = skippedSteps.has(index);
              const status = getOpenStatus(parseHours(resource.hours));
              return (
                <button
                  key={resource.id}
                  onClick={() => goToStep(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-3xl border-2 p-4 text-left shadow-[0_18px_48px_-32px_rgba(15,23,42,0.18)] transition-colors active:scale-[0.98]",
                    wasSkipped
                      ? "border-border/50 bg-muted/25"
                      : "border-border/70 bg-card/90 hover:border-primary/35 hover:bg-card"
                  )}
                >
                  <span className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border text-xs font-bold",
                    wasSkipped
                      ? "border-border/40 bg-muted-foreground/15 text-muted-foreground"
                      : "border-primary/25 bg-primary/12 text-primary"
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      wasSkipped ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {resource.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        status.isOpen ? "bg-emerald-500" : "bg-destructive"
                      )} />
                      <span className="text-sm font-medium text-muted-foreground">{status.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </motion.div>

          <motion.p
            className="mb-3 text-center text-lg font-semibold text-primary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {summaryHeadline}
          </motion.p>

          <motion.p
            className="mb-8 text-center text-xl font-bold leading-relaxed text-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {summaryBody}
          </motion.p>

          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
          >
            {remainingResources.length > 0 && (
              <>
                <Button
                  className="w-full rounded-2xl border-2 border-primary bg-primary px-4 py-6 text-base font-semibold text-primary-foreground shadow-[0_18px_40px_-24px_rgba(13,148,136,0.55)] hover:bg-primary/90"
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
                        {remainingResources.map((resource, index) => (
                          <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <ResourceCard resource={resource} size="sm" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            <Button
              onClick={() => setShowConfirm(true)}
              className="w-full rounded-2xl border-2 border-border/70 bg-card/90 px-4 py-6 text-base font-semibold text-foreground hover:border-primary/35 hover:bg-card"
            >
              Start over
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (total === 0) {
    const isHousingJourney = needs.includes(HOUSING);
    return (
      <div className="page-ambient relative flex min-h-screen items-center justify-center overflow-hidden px-8 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-16 left-[-4rem] h-72 w-72 rounded-full bg-primary/22 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-4rem] h-72 w-72 rounded-full bg-star-blue/15 blur-3xl" />
        </div>

        <div className="relative">
        <motion.p
          className="mb-3 text-lg font-semibold text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isHousingJourney ? "Nothing here looks like a safe fit yet." : "Nothing matched that combination yet."}
        </motion.p>
        <motion.p
          className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {isHousingJourney
            ? "Let's back up and change a couple answers. A different intake path, access need, or household type may open up better options."
            : "Try a different answer or go back and choose another kind of help."}
        </motion.p>
        <Button onClick={onBack} variant="outline" className="rounded-2xl border-2 border-border/70 bg-card/90 px-5 py-5 text-sm font-semibold">
          Go back and try again
        </Button>
        </div>
      </div>
    );
  }

  const resource = guidedResources[currentStep];
  const guidance = generateStepGuidance(resource, answerSubTags, currentStep);

  return (
    <div className="page-ambient relative flex h-[100dvh] flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-[-4rem] h-72 w-72 rounded-full bg-primary/22 blur-3xl" />
        <div className="absolute top-32 right-[-6rem] h-80 w-80 rounded-full bg-star-blue/15 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/11 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <motion.button
            onClick={() => setShowConfirm(true)}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            whileTap={{ scale: 0.95 }}
          >
            ← Start over
          </motion.button>

          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/85 p-1 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => setGuidanceVariant("split")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                guidanceVariant === "split"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Split
            </button>
            <button
              onClick={() => setGuidanceVariant("action-first")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                guidanceVariant === "action-first"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Action-first
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 flex flex-1 flex-col overflow-hidden"
        >
          <GuidanceStep
            resource={resource}
            guidance={guidance}
            subTags={answerSubTags}
            onSkip={handleSkip}
            onNext={handleNext}
            onBack={currentStep > 0 ? handleBack : undefined}
            showBack={currentStep > 0}
            nextLabel={currentStep + 1 < total ? "Next step" : "See summary"}
            variant={guidanceVariant}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
