import { Phone, Navigation, Mail, MapPin } from "lucide-react";
import { Resource } from "@/types";
import { StepGuidance } from "@/data/guidanceCopy";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
}

function getMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function GuidanceStep({ resource, guidance }: GuidanceStepProps) {
  const ActionIcon = {
    call: Phone,
    directions: Navigation,
    email: Mail,
  }[guidance.actionType];

  const actionHref = {
    call: `tel:${guidance.actionValue}`,
    directions: getMapsUrl(resource.location),
    email: `mailto:${guidance.actionValue}`,
  }[guidance.actionType];

  const actionLabel = {
    call: guidance.actionValue,
    directions: "Get directions",
    email: guidance.actionValue,
  }[guidance.actionType];

  const isExternal = guidance.actionType === "directions" || guidance.actionType === "email";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <p className="text-lg font-semibold text-primary mb-3">
        {guidance.headline}
      </p>

      <p className="text-xl font-bold text-foreground leading-relaxed max-w-[300px] mb-8">
        {guidance.body}
      </p>

      {/* Quiet action link */}
      <a
        href={actionHref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        <ActionIcon className="h-4 w-4" />
        <span className="underline underline-offset-2">{actionLabel}</span>
      </a>

      {/* Location */}
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
    </div>
  );
}
