import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { getQuestionsForCategories } from "@/data/followUpQuestions";

interface FollowUpFlowProps {
  needs: Category[];
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export default function FollowUpFlow({ needs, onComplete, onBack }: FollowUpFlowProps) {
  const questions = useMemo(() => getQuestionsForCategories(needs), [needs]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex) / total) * 100;

  const advance = (subTag?: string) => {
    const updated = { ...answers };
    if (subTag && question) {
      updated[question.id] = subTag;
    }
    setAnswers(updated);

    if (currentIndex + 1 >= total) {
      onComplete(updated);
    } else {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSelect = (subTag: string) => {
    advance(subTag);
  };

  const handleSkip = () => {
    advance();
  };

  if (!question) {
    onComplete(answers);
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 pt-6 pb-8">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <motion.button
          onClick={currentIndex === 0 ? onBack : () => {
            setDirection(-1);
            setCurrentIndex((i) => i - 1);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {currentIndex + 1} of {total}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">
            {question.question}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Tap what fits best. You can always change later.
          </p>

          <div className="flex flex-col gap-3">
            {question.options.map((opt) => (
              <motion.button
                key={opt.subTag}
                onClick={() => handleSelect(opt.subTag)}
                className="w-full text-left px-5 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-medium text-base transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                whileTap={{ scale: 0.97 }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="mt-auto pt-8 text-sm text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            Skip this question
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
