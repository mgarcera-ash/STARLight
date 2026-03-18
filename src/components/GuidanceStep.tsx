import { useState, useEffect, useMemo, useCallback } from "react";
import { Phone, Globe, MapPin, MessageCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Resource } from "@/types";
import { StepGuidance, generateContextTips, generateCallScript } from "@/data/guidanceCopy";

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
    candidates.push({
      key: "directions",
      icon: <MapPin className="h-5 w-5 text-primary" />,
      label: "How to get there",
      href: getMapsUrl(resource.location, !!resource.coordinates),
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

/* ── animation ── */

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const reveal = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.6, ease },
};

/* ── Dot Indicator ── */

function DotIndicator({ count, active, visible }: { count: number; active: number; visible: boolean }) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === active ? 20 : 6,
            height: 6,
            backgroundColor: i === active
              ? "hsl(var(--primary))"
              : "hsl(var(--muted-foreground) / 0.3)",
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </motion.div>
  );
}

/* ── Tap prompt ── */

function TapPrompt({ visible, onTap }: { visible: boolean; onTap: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="fixed inset-0 z-30 flex items-end justify-center pb-16 bg-transparent cursor-pointer"
          onClick={onTap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="text-xs text-muted-foreground select-none"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Tap to continue
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ── Scale pulse feedback ── */

function TapPulse({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 1 && (
        <motion.div
          key={trigger}
          className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0.15, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main component ── */

export default function GuidanceStep({ resource, guidance, subTags = [], onSkip, onNext, nextLabel }: GuidanceStepProps) {
  const tips = generateContextTips(resource);
  const callScript = generateCallScript(resource, subTags);
  const tiles = buildTiles(resource);
  const hasCoords = !!resource.coordinates;

  // Build sections list dynamically
  const sections = useMemo(() => {
    const s: string[] = ["intro"];
    if (tiles.length > 0) s.push("actions");
    if (callScript) s.push("script");
    s.push("navigation");
    return s;
  }, [tiles.length, callScript]);

  const sectionCount = sections.length;

  const [revealedCount, setRevealedCount] = useState(1);
  const unlocked = revealedCount >= sectionCount;

  // Reset when resource changes
  useEffect(() => {
    setRevealedCount(1);
  }, [resource.id]);

  const handleTap = useCallback(() => {
    if (!unlocked) {
      setRevealedCount((prev) => Math.min(prev + 1, sectionCount));
    }
  }, [unlocked, sectionCount]);

  const sectionFadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease },
  };

  return (
    <div
      className={`flex-1 flex flex-col ${unlocked ? "overflow-y-auto" : "overflow-hidden"}`}
    >
      <LayoutGroup>
        {/* Section: Intro */}
        <motion.div
          layout
          className="flex items-center justify-center px-8"
          style={{
            minHeight: unlocked ? "auto" : "100dvh",
            paddingTop: unlocked ? "2rem" : undefined,
            paddingBottom: unlocked ? "1rem" : undefined,
          }}
          transition={{ layout: { duration: 0.6, ease } }}
        >
          <div className="w-full max-w-[300px] mx-auto text-center">
            <motion.p
              className="text-lg font-semibold text-primary mb-3"
              {...reveal}
            >
              {guidance.headline}
            </motion.p>

            <motion.p
              className="text-xl font-bold text-foreground leading-relaxed mb-2"
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.15 }}
            >
              {guidance.lead}
            </motion.p>

            {guidance.detail && (
              <motion.p
                className="text-sm text-muted-foreground leading-relaxed"
                {...reveal}
                transition={{ ...reveal.transition, delay: 0.3 }}
              >
                {guidance.detail}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Section: Action tiles */}
        <AnimatePresence>
          {sections.includes("actions") && revealedCount > sections.indexOf("actions") && (
            <motion.div
              layout
              className="px-8 py-4 w-full max-w-[300px] mx-auto"
              {...sectionFadeIn}
              exit={{ opacity: 0 }}
              transition={{ ...sectionFadeIn.transition, layout: { duration: 0.5, ease } }}
            >
              <div className="flex gap-3">
                {tiles.map((tile) => (
                  <a
                    key={tile.key}
                    href={tile.href}
                    target={tile.external ? "_blank" : undefined}
                    rel={tile.external ? "noopener noreferrer" : undefined}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center hover:opacity-90 transition-opacity active:scale-[0.97] ${
                      tile.isMap ? "" : "bg-muted/50 hover:bg-muted/80"
                    }`}
                    style={
                      tile.isMap && hasCoords
                        ? {
                            backgroundImage: `url(${getStaticMapUrl(resource.coordinates!.lat, resource.coordinates!.lng)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            minHeight: "100px",
                          }
                        : { minHeight: "100px" }
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section: Call script */}
        <AnimatePresence>
          {sections.includes("script") && revealedCount > sections.indexOf("script") && (
            <motion.div
              layout
              className="px-8 py-4 w-full max-w-[300px] mx-auto"
              {...sectionFadeIn}
              exit={{ opacity: 0 }}
              transition={{ ...sectionFadeIn.transition, layout: { duration: 0.5, ease } }}
            >
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 text-left">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-medium text-primary">When they pick up:</p>
                </div>
                <p className="text-base text-foreground leading-relaxed italic">
                  "{callScript!.replace(/^Say:\s*/i, '')}"
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  That's it. They'll take it from there.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section: Navigation (tips + skip + next) — always last */}
        <AnimatePresence>
          {revealedCount >= sectionCount && (
            <motion.div
              layout
              className="px-8 py-4 w-full max-w-[300px] mx-auto"
              {...sectionFadeIn}
              exit={{ opacity: 0 }}
              transition={{ ...sectionFadeIn.transition, layout: { duration: 0.5, ease } }}
            >
              <div className="flex flex-col items-center gap-6">
                {tips.length > 0 && (
                  <div className="w-full">
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
                )}

                <div className="border-t border-border/40 w-full" />

                <a
                  href={`tel:${PEER_NAVIGATOR_PHONE}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Need help with this step? Talk to someone.
                </a>

                {onSkip && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSkip(); }}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    This doesn't work for me
                  </button>
                )}

                {onNext && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2"
                  >
                    {nextLabel || "Next step"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* Bottom spacer for final content */}
      {unlocked && <div className="pb-20" />}

      {/* Dot indicator */}
      <DotIndicator count={sectionCount} active={revealedCount - 1} visible={!unlocked} />

      {/* Tap pulse feedback */}
      <TapPulse trigger={revealedCount} />

      {/* Tap prompt — full-screen click target */}
      <TapPrompt visible={!unlocked} onTap={handleTap} />
    </div>
  );
}
