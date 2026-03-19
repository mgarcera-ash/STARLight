import { useState, useEffect } from "react";

export default function SplashIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"glow" | "exit" | "done">("glow");

  useEffect(() => {
    const glowTimer = setTimeout(() => setPhase("exit"), 1400);
    const exitTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2000);
    return () => {
      clearTimeout(glowTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "page-ambient-soft",
        phase === "exit" && "animate-splash-fade-out"
      )}
    >
      <h1
        className={cn(
          "text-5xl font-black tracking-tight text-foreground",
          "animate-splash-glow"
        )}
      >
        <span className="gradient-star-text">STAR</span>
        <span className="text-foreground/80">Light</span>
      </h1>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
