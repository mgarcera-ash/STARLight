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
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 text-left">
        <div className="flex items-center gap-1.5 mb-2">
          <MessageCircle className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-xs font-medium text-amber-500">When they pick up:</p>
        </div>
        <p className="text-base text-foreground leading-relaxed italic">
          "{script.replace(/^Say:\s*/i, '')}"
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          That's it. They'll take it from there.
        </p>
      </div>
    </motion.div>
  );
}
