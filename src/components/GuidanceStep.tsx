import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Navigation, Mail, ChevronRight, MapPin } from "lucide-react";
import { Resource } from "@/types";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StepGuidance {
  action: string;
  why: string;
  connector: string;
  prepPoints: string[];
  actionType: "call" | "directions" | "email";
  actionValue: string;
}

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
  stepNumber: number;
  delay: number;
}

function getMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function GuidanceStep({ resource, guidance, stepNumber, delay }: GuidanceStepProps) {
  const [showPrep, setShowPrep] = useState(false);

  const actionIcon = {
    call: Phone,
    directions: Navigation,
    email: Mail,
  }[guidance.actionType];
  const ActionIcon = actionIcon;

  const actionHref = {
    call: `tel:${guidance.actionValue}`,
    directions: getMapsUrl(resource.location),
    email: `mailto:${guidance.actionValue}`,
  }[guidance.actionType];

  const actionLabel = {
    call: `Call ${guidance.actionValue}`,
    directions: "Get directions",
    email: `Email them`,
  }[guidance.actionType];

  const isExternal = guidance.actionType === "directions" || guidance.actionType === "email";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {/* Connector text for steps 2+ */}
      {guidance.connector && (
        <p className="text-sm text-muted-foreground mb-3 italic">
          {guidance.connector}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        {/* Step label */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {stepNumber}
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Step {stepNumber}
          </span>
        </div>

        {/* Main instruction */}
        <h3 className="text-base font-bold text-foreground leading-snug mb-1">
          {guidance.action}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {guidance.why}
        </p>

        {/* Primary action button */}
        <a
          href={actionHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={cn(
            "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors",
            guidance.actionType === "call"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <ActionIcon className="h-4 w-4" />
          {actionLabel}
        </a>

        {/* Secondary: directions if primary is call */}
        {guidance.actionType === "call" && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <a
              href={getMapsUrl(resource.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              {resource.location}
            </a>
          </div>
        )}

        {/* What to know expandable */}
        {guidance.prepPoints.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <button
              onClick={() => setShowPrep(!showPrep)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  showPrep && "rotate-90"
                )}
              />
              What to know before you {guidance.actionType === "call" ? "call" : guidance.actionType === "email" ? "email" : "go"}
            </button>

            {showPrep && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 space-y-1.5 pl-5 overflow-hidden"
              >
                {guidance.prepPoints.map((point, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed list-disc">
                    {point}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        )}

        {/* Link to full detail */}
        <Link
          to={`/resource/${resource.id}`}
          className="flex items-center gap-1 mt-3 text-xs text-primary hover:underline font-medium"
        >
          Learn more about {resource.title}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}
