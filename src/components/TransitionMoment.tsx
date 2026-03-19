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
      className="page-ambient relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 cursor-pointer"
      onClick={onComplete}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-[-5rem] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[-5rem] h-72 w-72 rounded-full bg-star-blue/14 blur-3xl" />
      </div>

      <motion.p
        className="relative z-10 text-lg font-semibold text-primary mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        We hear you.
      </motion.p>

      <motion.p
        className="relative z-10 text-xl font-bold text-foreground text-center leading-relaxed max-w-[280px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {message}
      </motion.p>

      {/* Subtle pulsing dots */}
      <motion.div
        className="relative z-10 flex gap-1.5 mt-10"
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
