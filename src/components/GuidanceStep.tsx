import { useState } from "react";
import { Phone, Globe, MapPin, ChevronDown, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";

// Peer Navigator phone — hardcoded fallback for "Need help?" link
const PEER_NAVIGATOR_PHONE = "(215) 555-0106";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
  onSkip?: () => void;
}

function getMapsUrl(location: string, hasCoords: boolean, coords?: { lat: number; lng: number }) {
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

  // Priority 1: Call
  if (hasPhone) {
    candidates.push({
      key: "call",
      icon: <Phone className="h-5 w-5 text-primary" />,
      label: "Call",
      href: `tel:${resource.contact.phone}`,
    });
  }

  // Priority 2: Directions (if physical, non-confidential location)
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

  // Priority 3: Website (preferred over email)
  if (hasWebsite) {
    candidates.push({
      key: "website",
      icon: <Globe className="h-5 w-5 text-primary" />,
      label: "Visit website",
      href: resource.contact.website!,
      external: true,
    });
  }

  // Priority 4: Email — only if no phone AND no website (last resort)
  if (!hasPhone && !hasWebsite && hasEmail) {
    candidates.push({
      key: "email",
      icon: <Globe className="h-5 w-5 text-primary" />,
      label: "Message",
      href: `mailto:${resource.contact.email}`,
      external: true,
    });
  }

  // Max 2 tiles
  return candidates.slice(0, 2);
}

export default function GuidanceStep({ resource, guidance, onSkip }: GuidanceStepProps) {
  const [showTips, setShowTips] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, guidance.actionType === "call" ? [] : []);
  const tiles = buildTiles(resource);
  const hasCoords = !!resource.coordinates;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <p className="text-lg font-semibold text-primary mb-3">
        {guidance.headline}
      </p>

      {/* Lead — always visible */}
      <p className="text-xl font-bold text-foreground leading-relaxed max-w-[300px] mb-2">
        {guidance.lead}
      </p>

      {/* Detail — expandable */}
      {guidance.detail && (
        <div className="w-full max-w-[300px] mb-8">
          <AnimatePresence>
            {showDetail && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-sm text-muted-foreground leading-relaxed overflow-hidden"
              >
                {guidance.detail}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-xs text-primary/70 hover:text-primary transition-colors mt-1"
          >
            {showDetail ? "Less" : "Tell me more"}
          </button>
        </div>
      )}

      {!guidance.detail && <div className="mb-8" />}

      {/* Action tiles — max 2, side by side */}
      {tiles.length > 0 && (
        <div className="w-full max-w-[300px] flex gap-3 mb-6">
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
        </div>
      )}

      {/* "Need help with this step?" — Peer Navigator link */}
      <a
        href={`tel:${PEER_NAVIGATOR_PHONE}`}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        Need help with this step? Talk to someone.
      </a>

      {/* "This doesn't work for me" skip */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-4"
        >
          This doesn't work for me
        </button>
      )}

      {/* "I've tried this before" tips */}
      {tips.length > 0 && (
        <div className="w-full max-w-[300px]">
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${showTips ? "rotate-180" : ""}`}
            />
            I've tried this place before
          </button>

          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-muted/30 rounded-2xl p-4 text-left">
                  <p className="text-xs font-medium text-primary mb-2">
                    Here's what might help this time:
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
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
