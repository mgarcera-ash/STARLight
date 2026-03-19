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
  const progress = total === 0 ? 100 : (currentIndex / total) * 100;

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
      setCurrentIndex((index) => index + 1);
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
    <div className="page-ambient relative min-h-screen overflow-hidden px-4 pt-6 pb-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-[-4rem] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-28 right-[-5rem] h-72 w-72 rounded-full bg-star-blue/14 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md flex-col">
        <div className="mb-8 flex items-center gap-3">
          <motion.button
            onClick={currentIndex === 0 ? onBack : () => {
              setDirection(-1);
              setCurrentIndex((index) => index - 1);
            }}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {currentIndex + 1} of {total}
          </span>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-1 flex-col"
          >
            <div className="mb-6 rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm">
              <h1 className="text-2xl font-bold leading-tight text-foreground">
                {question.question}
              </h1>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {question.options.map((opt) => (
                <motion.button
                  key={opt.subTag}
                  onClick={() => handleSelect(opt.subTag)}
                  className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-left transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="text-base font-medium text-foreground">{opt.label}</div>
                </motion.button>
              ))}

              <motion.button
                onClick={handleSkip}
                className="w-full rounded-2xl border border-dashed border-border/80 bg-card/60 px-5 py-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                whileTap={{ scale: 0.97 }}
              >
                <div className="text-base font-medium text-muted-foreground">Skip this question</div>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
