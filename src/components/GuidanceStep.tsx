import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Phone, Globe, MapPin, MessageCircle, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

/* ── Snap Section wrapper ── */

function SnapSection({ children, sectionRef, className = "", visible = true }: {
  children: React.ReactNode;
  sectionRef?: React.Ref<HTMLDivElement>;
  className?: string;
  visible?: boolean;
}) {
  return (
    <div
      ref={sectionRef}
      className={`snap-section min-h-[60dvh] flex items-center justify-center px-8 py-10 ${className}`}
    >
      <motion.div
        className="w-full max-w-[300px]"
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease }}
      >
        {children}
      </motion.div>
    </div>
  );
}

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

/* ── Scroll hint chevron ── */

function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, y: [0, 6, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.3 },
            y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
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

  const [unlocked, setUnlocked] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [seenSections, setSeenSections] = useState<Set<number>>(new Set([0]));

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastSectionRef = useRef<HTMLDivElement | null>(null);

  // Build sections list dynamically
  const sections = useMemo(() => {
    const s: string[] = ["intro"];
    if (tiles.length > 0) s.push("actions");
    if (callScript) s.push("script");
    s.push("navigation"); // always last: tips + skip + next
    return s;
  }, [tiles.length, callScript]);

  const sectionCount = sections.length;

  // Ref setter callback
  const setSectionRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[index] = el;
    if (index === sectionCount - 1) {
      lastSectionRef.current = el;
    }
  }, [sectionCount]);

  // IntersectionObserver for active section tracking + unlock
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx >= 0) {
              setActiveSection(idx);
              setSeenSections((prev) => {
                if (prev.has(idx)) return prev;
                const next = new Set(prev);
                next.add(idx);
                return next;
              });
            }

            // Unlock when last section is reached
            if (entry.target === lastSectionRef.current) {
              setUnlocked(true);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sectionCount]);

  // Reset state when resource changes
  useEffect(() => {
    setUnlocked(false);
    setActiveSection(0);
    setSeenSections(new Set([0]));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [resource.id]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col overflow-y-auto"
      style={{
        scrollSnapType: unlocked ? "none" : "y mandatory",
      }}
    >
      {/* Section 1: Intro */}
      <SnapSection sectionRef={setSectionRef(0)} visible={seenSections.has(0)}>
        <motion.p
          className="text-lg font-semibold text-primary mb-3 text-center"
          {...reveal}
        >
          {guidance.headline}
        </motion.p>

        <motion.p
          className="text-xl font-bold text-foreground leading-relaxed text-center mb-2"
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.15 }}
        >
          {guidance.lead}
        </motion.p>

        {guidance.detail && (
          <motion.p
            className="text-sm text-muted-foreground leading-relaxed text-center"
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.3 }}
          >
            {guidance.detail}
          </motion.p>
        )}
      </SnapSection>

      {/* Section 2: Action tiles (conditional) */}
      {tiles.length > 0 && (
        <SnapSection sectionRef={setSectionRef(sections.indexOf("actions"))} visible={seenSections.has(sections.indexOf("actions"))}>
          <motion.div
            className="flex gap-3"
            {...reveal}
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
          </motion.div>
        </SnapSection>
      )}

      {/* Section 3: Call script (conditional) */}
      {callScript && (
        <SnapSection sectionRef={setSectionRef(sections.indexOf("script"))} visible={seenSections.has(sections.indexOf("script"))}>
          <motion.div {...reveal}>
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
        </SnapSection>
      )}

      {/* Section 4: Tips + Navigation (always last) */}
      <SnapSection sectionRef={setSectionRef(sectionCount - 1)} visible={seenSections.has(sectionCount - 1)}>
        <div className="flex flex-col items-center gap-6">
          {/* Tips */}
          {tips.length > 0 && (
            <motion.div className="w-full" {...reveal}>
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
            </motion.div>
          )}

          {/* Divider */}
          <div className="border-t border-border/40 w-full" />

          {/* Peer navigator */}
          <motion.a
            href={`tel:${PEER_NAVIGATOR_PHONE}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.1 }}
          >
            Need help with this step? Talk to someone.
          </motion.a>

          {/* Skip */}
          {onSkip && (
            <motion.button
              onClick={onSkip}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.2 }}
            >
              This doesn't work for me
            </motion.button>
          )}

          {/* Next */}
          {onNext && (
            <motion.button
              onClick={onNext}
              className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2"
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.3 }}
            >
              {nextLabel || "Next step"}
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </SnapSection>

      {/* Dot indicator */}
      <DotIndicator count={sectionCount} active={activeSection} visible={!unlocked} />

      {/* Scroll hint */}
      <ScrollHint visible={!unlocked && activeSection < sectionCount - 1} />
    </div>
  );
}
