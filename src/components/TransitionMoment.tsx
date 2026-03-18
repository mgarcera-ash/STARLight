import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTransitionMessage } from "@/data/transitionCopy";

interface TransitionMomentProps {
  answers: Record<string, string>;
  onComplete: () => void;
}

export default function TransitionMoment({ answers, onComplete }: TransitionMomentProps) {
  const message = getTransitionMessage(answers);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) onComplete();
  }, [ready, onComplete]);

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-8 cursor-pointer"
      onClick={onComplete}
    >
      <motion.p
        className="text-lg font-semibold text-primary mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        We hear you.
      </motion.p>

      <motion.p
        className="text-xl font-bold text-foreground text-center leading-relaxed max-w-[280px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {message}
      </motion.p>

      {/* Subtle pulsing dots */}
      <motion.div
        className="flex gap-1.5 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
