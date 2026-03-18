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
        className="flex items-center gap-3 rounded-2xl p-4 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors active:scale-[0.98]"
      >
        <MapPin className="h-5 w-5 text-destructive shrink-0" />
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">How to get there</p>
          <p className="text-xs text-muted-foreground">{location}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
      </a>
    </motion.div>
  );
}
