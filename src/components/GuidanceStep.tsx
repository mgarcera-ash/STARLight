import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips } from "@/data/guidanceCopy";

interface GuidanceStepProps {
  resource: Resource;
  guidance: StepGuidance;
}

function getMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function getStaticMapUrl(lat: number, lng: number, zoom = 15): string {
  const n = Math.pow(2, zoom);
  const tileX = Math.floor(((lng + 180) / 360) * n);
  const tileY = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
}

export default function GuidanceStep({ resource, guidance }: GuidanceStepProps) {
  const [showTips, setShowTips] = useState(false);
  const tips = generateContextTips(resource);

  const hasPhone = !!resource.contact.phone;
  const hasEmail = !!resource.contact.email;
  const hasLocation = resource.location && !resource.location.toLowerCase().includes("phone/text");
  const hasCoords = !!resource.coordinates;

  // Build ordered tiles: call/email on left, directions always on right
  const leftTiles: React.ReactNode[] = [];

  if (hasPhone) {
    leftTiles.push(
      <a
        key="call"
        href={`tel:${resource.contact.phone}`}
        className="flex-1 bg-muted/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-muted/80 transition-colors active:scale-[0.97]"
      >
        <Phone className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Call</span>
      </a>
    );
  }

  if (hasEmail) {
    leftTiles.push(
      <a
        key="email"
        href={`mailto:${resource.contact.email}`}
        className="flex-1 bg-muted/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-muted/80 transition-colors active:scale-[0.97]"
      >
        <Mail className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Email</span>
      </a>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <p className="text-lg font-semibold text-primary mb-3">
        {guidance.headline}
      </p>

      <p className="text-xl font-bold text-foreground leading-relaxed max-w-[300px] mb-8">
        {guidance.body}
      </p>

      {/* Action squircle tiles — directions always right */}
      <div className="flex gap-3 w-full max-w-[300px] mb-6">
        {leftTiles}

        {hasLocation && (
          <a
            href={getMapsUrl(resource.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-2xl overflow-hidden relative flex flex-col items-center justify-end hover:opacity-90 transition-opacity active:scale-[0.97]"
            style={
              hasCoords
                ? {
                    backgroundImage: `url(${getStaticMapUrl(resource.coordinates!.lat, resource.coordinates!.lng)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "80px",
                  }
                : undefined
            }
          >
            {/* Overlay for readability */}
            {hasCoords ? (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
            ) : (
              <div className="absolute inset-0 bg-muted/50" />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2 p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Directions</span>
            </div>
          </a>
        )}

        {resource.contact.email && (
          <a
            href={`mailto:${resource.contact.email}`}
            className="flex-1 bg-muted/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-muted/80 transition-colors active:scale-[0.97]"
          >
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Email</span>
          </a>
        )}
      </div>

      {/* "I've tried this before" nudge */}
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
