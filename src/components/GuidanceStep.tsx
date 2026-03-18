import { useMemo } from "react";
import { Phone, Globe, MapPin, MessageCircle, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import HoursIndicator from "@/components/HoursIndicator";

const PEER_NAVIGATOR_PHONE = "(215) 555-0106";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
  subTags?: string[];
  onSkip?: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

/* ── helpers ── */

function getMapsUrl(location: string, hasCoords: boolean) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}${hasCoords ? "&travelmode=transit" : ""}`;
}

function getStaticMapUrl(lat: number, lng: number, zoom = 15): string {
  const n = Math.pow(2, zoom);
  const tileX = Math.floor(((lng + 180) / 360) * n);
  const tileY = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
}

function isConfidentialLocation(location: string): boolean {
  const l = location.toLowerCase();
  return l.includes("confidential") || l.includes("phone/text") || l.includes("phone-based") || l.includes("text-based");
}

type Tile = { key: string; icon: React.ReactNode; label: string; href: string; external?: boolean; isMap?: boolean };

function buildTiles(resource: Resource): Tile[] {
  const hasPhone = !!resource.contact.phone;
  const hasWebsite = !!resource.contact.website;
  const hasEmail = !!resource.contact.email;

  const candidates: Tile[] = [];

  if (hasPhone) {
    candidates.push({
      key: "call",
      icon: <Phone className="h-5 w-5 text-primary" />,
      label: "Call",
      href: `tel:${resource.contact.phone}`,
    });
  }

  if (hasWebsite) {
    candidates.push({
      key: "website",
      icon: <Globe className="h-5 w-5 text-primary" />,
      label: "Visit website",
      href: resource.contact.website!,
      external: true,
    });
  }

  if (!hasPhone && !hasWebsite && hasEmail) {
    candidates.push({
      key: "email",
      icon: <Globe className="h-5 w-5 text-primary" />,
      label: "Message",
      href: `mailto:${resource.contact.email}`,
      external: true,
    });
  }

  return candidates.slice(0, 2);
}

/* ── animation ── */

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

function stagger(delay: number) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  };
}

/* ── Main component ── */

export default function GuidanceStep({ resource, guidance, subTags = [], onSkip, onNext, nextLabel }: GuidanceStepProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);
  const tiles = useMemo(() => buildTiles(resource), [resource]);
  const hasCoords = !!resource.coordinates;
  const hasLocation = !!resource.location && !isConfidentialLocation(resource.location);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-md mx-auto px-6 pt-12 pb-20">

        {/* Intro */}
        <motion.div className="text-center mb-6" {...stagger(0)}>
          <p className="text-lg font-semibold text-primary mb-3">
            {guidance.headline}
          </p>
          <p className="text-xl font-bold text-foreground leading-relaxed mb-2">
            {guidance.lead}
          </p>
          {guidance.detail && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {guidance.detail}
            </p>
          )}
        </motion.div>

        {/* Action tiles */}
        {tiles.length > 0 && (
          <motion.div className="mb-6" {...stagger(0.6)}>
            <div className="flex gap-3">
              {tiles.map((tile) => (
                <a
                  key={tile.key}
                  href={tile.href}
                  target={tile.external ? "_blank" : undefined}
                  rel={tile.external ? "noopener noreferrer" : undefined}
                  className="flex-1 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 hover:opacity-90 transition-opacity active:scale-[0.97]"
                  style={{ minHeight: "100px" }}
                >
                  <div className="relative z-10 flex flex-col items-center gap-2 p-4">
                    {tile.icon}
                    <span className="text-sm font-medium text-foreground">{tile.label}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call script */}
        {callScript && (
          <motion.div className="mb-6" {...stagger(1.0)}>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-1.5 mb-2">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-medium text-primary">When they pick up:</p>
              </div>
              <p className="text-base text-foreground leading-relaxed italic">
                "{callScript.replace(/^Say:\s*/i, '')}"
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                That's it. They'll take it from there.
              </p>
            </div>
          </motion.div>
        )}

        {/* How to get there */}
        {hasLocation && (
          <motion.div className="mb-6" {...stagger(1.2)}>
            <a
              href={getMapsUrl(resource.location, hasCoords)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl p-4 bg-muted/50 hover:bg-muted/80 transition-colors active:scale-[0.98]"
            >
              <MapPin className="h-5 w-5 text-destructive shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">How to get there</p>
                <p className="text-xs text-muted-foreground">{resource.location}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            </a>
          </motion.div>
        )}

        {/* Navigation section */}
        <motion.div className="flex flex-col items-center gap-6" {...stagger(1.6)}>

          {/* Expandable tips */}
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
      </div>
    </div>
  );
}
