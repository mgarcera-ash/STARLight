import { MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { stagger, getMapsUrl } from "./types";

interface LocationCardProps {
  location: string;
  hasCoords: boolean;
  delay?: number;
}

export default function LocationCard({ location, hasCoords, delay = 1.5 }: LocationCardProps) {
  return (
    <motion.div className="mb-6" {...stagger(delay)}>
      <a
        href={getMapsUrl(location, hasCoords)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-3xl border-2 border-rose-300/55 bg-card/95 p-5 shadow-[0_18px_48px_-30px_rgba(244,63,94,0.35)] transition-all hover:border-rose-400/70 hover:bg-card active:scale-[0.98]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-foreground">How to get there</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{location}</p>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground" />
      </a>
    </motion.div>
  );
}
