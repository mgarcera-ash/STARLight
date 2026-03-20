import { ChevronLeft, ChevronRight, ChevronDown, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { stagger, PEER_NAVIGATOR_PHONE } from "./types";

interface GuidanceFooterProps {
  tips: string[];
  onSkip?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  delay?: number;
}

export default function GuidanceFooter({ tips, onSkip, onNext, onBack, nextLabel, showBack = false, delay = 1.8 }: GuidanceFooterProps) {
  return (
    <motion.div className="flex flex-col gap-4" {...stagger(delay)}>
      {tips.length > 0 && (
        <Collapsible className="w-full rounded-3xl border-2 border-border/70 bg-card/90 p-4 shadow-[0_18px_48px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary">
            <span>Tried this place before but didn&apos;t get far?</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-4 space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="rounded-2xl border border-border/60 bg-muted/35 px-3.5 py-3 text-sm leading-relaxed text-muted-foreground">
                  {tip}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      <a
        href={`tel:${PEER_NAVIGATOR_PHONE}`}
        className="flex items-center gap-3 rounded-3xl border-2 border-border/70 bg-card/90 px-4 py-4 text-left shadow-[0_18px_48px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-colors hover:border-primary/35 hover:bg-card"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Phone className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Need help with this step?</p>
          <p className="text-sm text-muted-foreground">Talk to someone.</p>
        </div>
      </a>

      {onSkip && (
        <button
          onClick={onSkip}
          className="rounded-2xl border-2 border-dashed border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          This doesn&apos;t work for me
        </button>
      )}

      {(showBack || onNext) && (
        <div className="flex items-center gap-3 pt-1">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-border/70 bg-card/90 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-card active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-24px_rgba(13,148,136,0.55)] transition-colors hover:bg-primary/90 active:scale-[0.97]"
            >
              {nextLabel || "Next step"}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
