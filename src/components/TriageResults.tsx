import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { useResources } from "@/context/ResourceContext";
import { generateStepGuidance } from "@/data/guidanceCopy";
import GuidanceStep from "@/components/GuidanceStep";
import ResourceCard from "@/components/ResourceCard";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";

interface TriageResultsProps {
  needs: Category[];
  followUpAnswers: Record<string, string>;
  onBack: () => void;
}

const MAX_GUIDED_STEPS = 3;

export default function TriageResults({ needs, followUpAnswers, onBack }: TriageResultsProps) {
  const { approvedResources } = useResources();
  const [showAllOptions, setShowAllOptions] = useState(false);

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

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-24">
      {/* Back button */}
      <motion.button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Start over
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-xl font-bold text-foreground mb-1">
          Here's your plan.
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Go through these steps one at a time. Start with the first one.
        </p>
      </motion.div>

      {/* Guided steps */}
      <div className="flex flex-col gap-5 mb-8">
        {guidedResources.map((resource, i) => {
          const guidance = generateStepGuidance(resource, answerSubTags, i);
          return (
            <GuidanceStep
              key={resource.id}
              resource={resource}
              guidance={guidance}
              stepNumber={i + 1}
              delay={0.8 + i * 0.3}
            />
          );
        })}
      </div>

      {/* Fallback: See all options */}
      {remainingResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 + guidedResources.length * 0.3 + 0.2 }}
        >
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't work out? There are more places that can help.
            </p>
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
          </div>

          <AnimatePresence>
            {showAllOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 mt-4">
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
        </motion.div>
      )}

      {/* Empty state */}
      {guidedResources.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-muted-foreground">
            No resources match your selection right now.
          </p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Try different needs
          </Button>
        </motion.div>
      )}
    </div>
  );
}
