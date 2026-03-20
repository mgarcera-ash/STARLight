import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { stagger } from "./types";

interface CallScriptProps {
  script: string;
  delay?: number;
}

export default function CallScript({ script, delay = 1.2 }: CallScriptProps) {
  return (
    <motion.div className="mb-6" {...stagger(delay)}>
      <div className="rounded-3xl border-2 border-amber-300/55 bg-card/95 p-5 text-left shadow-[0_18px_48px_-28px_rgba(245,158,11,0.4)] backdrop-blur-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
          <MessageCircle className="h-3.5 w-3.5" />
          When they pick up
        </div>
        <p className="text-base font-medium leading-relaxed text-foreground italic">
          "{script.replace(/^Say:\s*/i, '')}"
        </p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          That&apos;s enough to get the conversation started.
        </p>
      </div>
    </motion.div>
  );
}
