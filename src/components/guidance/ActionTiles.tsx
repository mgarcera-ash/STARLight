import { useMemo } from "react";
import { Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Resource } from "@/types";
import { Tile, stagger } from "./types";

function buildTiles(resource: Resource): (Tile & { bg: string })[] {
  const hasPhone = !!resource.contact.phone;
  const hasWebsite = !!resource.contact.website;
  const hasEmail = !!resource.contact.email;

  const candidates: (Tile & { bg: string })[] = [];

  if (hasPhone) {
    candidates.push({
      key: "call",
      icon: <Phone className="h-5 w-5 text-amber-500" />,
      label: "Tap to call",
      href: `tel:${resource.contact.phone}`,
      bg: "bg-amber-500/5 border border-amber-500/10",
    });
  }

  if (hasWebsite) {
    candidates.push({
      key: "website",
      icon: <Globe className="h-5 w-5 text-sky-400" />,
      label: "Tap to visit website",
      href: resource.contact.website!,
      external: true,
      bg: "bg-sky-400/5 border border-sky-400/10",
    });
  }

  if (!hasPhone && !hasWebsite && hasEmail) {
    candidates.push({
      key: "email",
      icon: <Globe className="h-5 w-5 text-sky-400" />,
      label: "Tap to message",
      href: `mailto:${resource.contact.email}`,
      external: true,
      bg: "bg-sky-400/5 border border-sky-400/10",
    });
  }

  return candidates.slice(0, 2);
}

interface ActionTilesProps {
  resource: Resource;
  delay?: number;
}

export default function ActionTiles({ resource, delay = 0.8 }: ActionTilesProps) {
  const tiles = useMemo(() => buildTiles(resource), [resource]);

  if (tiles.length === 0) return null;

  return (
    <motion.div className="mb-6" {...stagger(delay)}>
      <div className="flex gap-3">
        {tiles.map((tile) => (
          <a
            key={tile.key}
            href={tile.href}
            target={tile.external ? "_blank" : undefined}
            rel={tile.external ? "noopener noreferrer" : undefined}
            className={`flex-1 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center ${tile.bg} hover:opacity-90 transition-opacity active:scale-[0.97] animate-soft-pulse`}
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
  );
}
