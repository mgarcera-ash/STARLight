import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe, MessageCircle, Clock3, ShieldCheck } from "lucide-react";
import { Resource } from "@/types";
import { StepGuidance } from "@/data/guidanceCopy";
import { stagger } from "./types";

interface InfoCarouselProps {
  resource: Resource;
  guidance: StepGuidance;
  tips: string[];
  callScript: string | null;
  delay?: number;
}

interface InfoCardProps {
  title: string;
  body: string;
  icon: ReactNode;
  href?: string;
  external?: boolean;
}

function getPopulationLabel(resource: Resource) {
  if (resource.populationTags.includes("families")) return "Families";
  if (resource.populationTags.includes("youth")) return "Youth";
  if (resource.populationTags.includes("women")) return "Women";
  if (resource.populationTags.includes("men")) return "Men";
  if (resource.populationTags.includes("single_adults")) return "Single adults";
  return null;
}

function getInfoCards(resource: Resource, guidance: StepGuidance, tips: string[], callScript: string | null): InfoCardProps[] {
  const cards: InfoCardProps[] = [];
  const population = getPopulationLabel(resource);

  if (guidance.detail) {
    cards.push({
      title: "What to know",
      body: guidance.detail,
      icon: <MessageCircle className="h-4.5 w-4.5" />,
    });
  }

  if (resource.contact.website) {
    cards.push({
      title: "Website",
      body: "Visit their site for updates, forms, and contact details.",
      icon: <Globe className="h-4.5 w-4.5" />,
      href: resource.contact.website,
      external: true,
    });
  }

  if (resource.hours || resource.availabilityType || typeof resource.beds === "number") {
    const details = [
      resource.availabilityType === "twenty_four_hours" ? "24 hours" : null,
      resource.availabilityType === "overnight" ? "Overnight" : null,
      typeof resource.beds === "number" ? `${resource.beds} beds` : null,
      resource.hours || null,
    ].filter(Boolean);

    cards.push({
      title: "Hours and space",
      body: details.join(" • "),
      icon: <Clock3 className="h-4.5 w-4.5" />,
    });
  }

  const fitDetails = [
    population,
    resource.intakeType === "walk_in" ? "Walk in" : null,
    resource.intakeType === "call_first" ? "Call first" : null,
    resource.intakeType === "referral" ? "Referral needed" : null,
    resource.accessibilityTags.includes("wheelchair_accessible") ? "Wheelchair access" : null,
    resource.accessibilityTags.includes("ground_floor") ? "Ground floor" : null,
  ].filter(Boolean);

  if (fitDetails.length > 0 || resource.eligibility) {
    cards.push({
      title: "Fit and intake",
      body: resource.eligibility
        ? `${fitDetails.join(" • ")}${fitDetails.length ? " • " : ""}${resource.eligibility}`
        : fitDetails.join(" • "),
      icon: <ShieldCheck className="h-4.5 w-4.5" />,
    });
  }

  if (callScript) {
    cards.push({
      title: "When they pick up",
      body: callScript.replace(/^Say:\s*/i, ""),
      icon: <MessageCircle className="h-4.5 w-4.5" />,
    });
  }

  if (tips.length > 0) {
    cards.push({
      title: "Helpful tip",
      body: tips[0],
      icon: <ShieldCheck className="h-4.5 w-4.5" />,
    });
  }

  return cards.slice(0, 6);
}

function InfoCard({ title, body, icon, href, external }: InfoCardProps) {
  const inner = (
    <>
      <div className="mb-3 flex items-center gap-2 text-primary">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/12">
          {icon}
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      {href && (
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Open
          {external && <ExternalLink className="h-3.5 w-3.5" />}
        </div>
      )}
    </>
  );

  const className = "w-[270px] shrink-0 snap-start rounded-3xl border-2 border-border/70 bg-card/92 p-5 shadow-[0_18px_48px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-colors";

  if (!href) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${className} hover:border-primary/35 hover:bg-card`}
    >
      {inner}
    </a>
  );
}

export default function InfoCarousel({ resource, guidance, tips, callScript, delay = 1.15 }: InfoCarouselProps) {
  const cards = getInfoCards(resource, guidance, tips, callScript);

  if (cards.length === 0) return null;

  return (
    <motion.div className="mb-6" {...stagger(delay)}>
      <p className="mb-3 text-sm font-semibold text-foreground">Information</p>
      <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card) => (
          <InfoCard key={`${card.title}-${card.body}`} {...card} />
        ))}
      </div>
    </motion.div>
  );
}
