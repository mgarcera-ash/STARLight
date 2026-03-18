import { ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { stagger, PEER_NAVIGATOR_PHONE } from "./types";

interface GuidanceFooterProps {
  tips: string[];
  onSkip?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  delay?: number;
}

export default function GuidanceFooter({ tips, onSkip, onNext, nextLabel, delay = 1.8 }: GuidanceFooterProps) {
  return (
    <motion.div className="flex flex-col items-center gap-6" {...stagger(delay)}>
      {tips.length > 0 && (
        <Collapsible className="w-full">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors group">
            Tried this place before?
            <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="space-y-2 mt-3">
              {tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="border-t border-border/40 w-full" />

      <a
        href={`tel:${PEER_NAVIGATOR_PHONE}`}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Need help with this step? Talk to someone.
      </a>

      {onSkip && (
        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          This doesn't work for me
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2"
        >
          {nextLabel || "Next step"}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}
