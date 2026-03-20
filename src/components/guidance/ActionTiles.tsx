import { useMemo } from "react";
import { Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Resource } from "@/types";
import { Tile, stagger } from "./types";

function buildTiles(resource: Resource): (Tile & { bg: string; className?: string; iconClassName?: string; labelClassName?: string })[] {
  const hasPhone = !!resource.contact.phone;
  const hasWebsite = !!resource.contact.website;
  const hasEmail = !!resource.contact.email;

  const candidates: (Tile & { bg: string })[] = [];

  if (hasPhone) {
    candidates.push({
      key: "call",
      icon: <Phone className="h-6 w-6 text-white" />,
      label: "Tap to call",
      href: `tel:${resource.contact.phone}`,
      bg: "bg-star-blue border border-star-blue/90 shadow-[0_16px_36px_-18px_rgba(37,99,235,0.65)]",
      className: "aspect-square max-w-[112px] flex-none rounded-full",
      iconClassName: "gap-1.5",
      labelClassName: "text-primary-foreground text-center text-xs font-semibold leading-tight",
    });
  }

  if (hasWebsite) {
    candidates.push({
      key: "website",
      icon: <Globe className="h-5 w-5 text-sky-400" />,
      label: "Tap to visit website",
      href: resource.contact.website!,
      external: true,
      bg: "bg-sky-400/10 border border-sky-400/15",
    });
  }

  if (!hasPhone && !hasWebsite && hasEmail) {
    candidates.push({
      key: "email",
      icon: <Globe className="h-5 w-5 text-sky-400" />,
      label: "Tap to message",
      href: `mailto:${resource.contact.email}`,
      external: true,
      bg: "bg-sky-400/10 border border-sky-400/15",
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
            className={`relative flex flex-col items-center justify-center overflow-hidden transition-opacity active:scale-[0.97] animate-soft-pulse ${tile.bg} ${tile.className ?? "flex-1 rounded-2xl"}`}
            style={{ minHeight: tile.key === "call" ? "112px" : "100px" }}
          >
            <div className={`relative z-10 flex flex-col items-center ${tile.iconClassName ?? "gap-2"} p-4`}>
              {tile.icon}
              <span className={tile.labelClassName ?? "text-sm font-medium text-foreground"}>{tile.label}</span>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
