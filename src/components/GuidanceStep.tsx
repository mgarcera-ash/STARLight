import { Phone, Globe, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";
import { ChevronRight } from "lucide-react";

const PEER_NAVIGATOR_PHONE = "(215) 555-0106";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
  subTags?: string[];
  onSkip?: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

function getMapsUrl(location: string, hasCoords: boolean, _coords?: { lat: number; lng: number }) {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  return hasCoords ? `${base}&travelmode=transit` : base;
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
  const hasLocation = !!resource.location && !isConfidentialLocation(resource.location);

  const candidates: Tile[] = [];

  if (hasPhone) {
    candidates.push({
      key: "call",
      icon: <Phone className="h-5 w-5 text-primary" />,
      label: "Call",
      href: `tel:${resource.contact.phone}`,
    });
  }

  if (hasLocation) {
    const hasCoords = !!resource.coordinates;
    candidates.push({
      key: "directions",
      icon: <MapPin className="h-5 w-5 text-primary" />,
      label: "How to get there",
      href: getMapsUrl(resource.location, hasCoords, resource.coordinates),
      external: true,
      isMap: true,
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

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};

export default function GuidanceStep({ resource, guidance, subTags = [], onSkip, onNext, nextLabel }: GuidanceStepProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);
  const tiles = buildTiles(resource);
  const hasCoords = !!resource.coordinates;

  return (
    <div className="flex-1 flex flex-col px-8 pt-6 pb-12 overflow-y-auto">
      {/* Headline */}
      <motion.p
        className="text-lg font-semibold text-primary mb-3 text-center"
        {...reveal}
      >
        {guidance.headline}
      </motion.p>

      {/* Lead */}
      <motion.p
        className="text-xl font-bold text-foreground leading-relaxed max-w-[300px] mx-auto text-center mb-2"
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.1 }}
      >
        {guidance.lead}
      </motion.p>

      {/* Detail — always visible, muted */}
      {guidance.detail && (
        <motion.p
          className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mx-auto text-center mb-8"
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.2 }}
        >
          {guidance.detail}
        </motion.p>
      )}

      {!guidance.detail && <div className="mb-8" />}

      {/* Action tiles */}
      {tiles.length > 0 && (
        <motion.div
          className="w-full max-w-[300px] mx-auto flex gap-3 mb-8"
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.3 }}
        >
          {tiles.map((tile) => (
            <a
              key={tile.key}
              href={tile.href}
              target={tile.external ? "_blank" : undefined}
              rel={tile.external ? "noopener noreferrer" : undefined}
              className={`flex-1 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center hover:opacity-90 transition-opacity active:scale-[0.97] ${
                tile.isMap ? "" : "bg-muted/50 hover:bg-muted/80"
              }`}
              style={
                tile.isMap && hasCoords
                  ? {
                      backgroundImage: `url(${getStaticMapUrl(resource.coordinates!.lat, resource.coordinates!.lng)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      minHeight: "80px",
                    }
                  : { minHeight: "80px" }
              }
            >
              {tile.isMap && (
                hasCoords
                  ? <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
                  : <div className="absolute inset-0 bg-muted/50" />
              )}
              <div className="relative z-10 flex flex-col items-center gap-2 p-4">
                {tile.icon}
                <span className="text-sm font-medium text-foreground">{tile.label}</span>
              </div>
            </a>
          ))}
        </motion.div>
      )}

      {/* Call script — always visible */}
      {callScript && (
        <motion.div
          className="w-full max-w-[300px] mx-auto mb-8"
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.4 }}
        >
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageCircle className="h-3 w-3 text-primary" />
              <p className="text-xs font-medium text-primary">When they pick up:</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed italic">
              "{callScript.replace(/^Say:\s*/i, '')}"
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              That's it. They'll take it from there.
            </p>
          </div>
        </motion.div>
      )}

      {/* Tips — always visible */}
      {tips.length > 0 && (
        <motion.div
          className="w-full max-w-[300px] mx-auto mb-8"
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.5 }}
        >
          <div className="border-t border-border/40 pt-6">
            <p className="text-xs font-medium text-primary mb-3">
              Tried this place before? Here's what might help:
            </p>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Bottom section — help + skip + next */}
      <motion.div
        className="w-full max-w-[300px] mx-auto mt-auto pt-6 flex flex-col items-center gap-4"
        {...reveal}
        transition={{ ...reveal.transition, delay: 0.6 }}
      >
        <div className="border-t border-border/40 w-full pt-6 flex flex-col items-center gap-4">
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
        </div>
      </motion.div>
    </div>
  );
}
