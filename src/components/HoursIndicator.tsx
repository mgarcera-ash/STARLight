import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const DAY_MAP: Record<string, number> = {
  sun: 6, mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5,
};

interface ParsedHours {
  is247: boolean;
  openDays: boolean[];          // [M, T, W, T, F, S, S]
  openTime: string | null;      // e.g. "8:00 AM"
  closeTime: string | null;     // e.g. "5:00 PM"
  raw: string;
}

function parseDayRange(start: string, end: string): number[] {
  const s = DAY_MAP[start.toLowerCase().slice(0, 3)];
  const e = DAY_MAP[end.toLowerCase().slice(0, 3)];
  if (s === undefined || e === undefined) return [];
  const days: number[] = [];
  for (let i = s; i <= e; i++) days.push(i);
  // handle wrap (e.g. Sat–Sun wouldn't happen but just in case)
  if (e < s) for (let i = s; i <= 6; i++) days.push(i);
  return days;
}

function parseHours(hours: string): ParsedHours {
  const h = hours.toLowerCase();
  const openDays = Array(7).fill(false) as boolean[];

  // 24/7
  if (h.includes("24/7") || h.includes("24-hour") || h.includes("24 hour")) {
    return { is247: true, openDays: Array(7).fill(true), openTime: null, closeTime: null, raw: hours };
  }

  // "daily"
  if (h.includes("daily")) {
    return { is247: false, openDays: Array(7).fill(true), openTime: null, closeTime: null, raw: hours };
  }

  let firstOpen: string | null = null;
  let firstClose: string | null = null;

  // Split by comma for multiple segments
  const segments = hours.split(",").map((s) => s.trim());

  for (const seg of segments) {
    // Match day range: "Mon–Fri", "Mon–Sun", "Mon-Sat"
    const rangeMatch = seg.match(/(\w{3})\s*[–\-]\s*(\w{3})/i);
    // Match individual days: "Tue & Thu", "Tue"
    const individualMatch = seg.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/gi);
    // Match times
    const timeMatch = seg.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–\-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);

    if (rangeMatch) {
      const days = parseDayRange(rangeMatch[1], rangeMatch[2]);
      days.forEach((d) => { openDays[d] = true; });
    } else if (individualMatch) {
      individualMatch.forEach((day) => {
        const idx = DAY_MAP[day.toLowerCase().slice(0, 3)];
        if (idx !== undefined) openDays[idx] = true;
      });
    }

    if (timeMatch && !firstOpen) {
      firstOpen = timeMatch[1].trim();
      firstClose = timeMatch[2].trim();
    }
  }

  return { is247: false, openDays, openTime: firstOpen, closeTime: firstClose, raw: hours };
}

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

function getOpenStatus(parsed: ParsedHours): { isOpen: boolean; label: string } {
  if (parsed.is247) return { isOpen: true, label: "Open 24/7" };

  const now = new Date();
  // JS: 0=Sun, 1=Mon... → our mapping: 0=Mon...6=Sun
  const jsDay = now.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const isOpenDay = parsed.openDays[dayIdx];

  if (!isOpenDay) {
    // Find next open day
    for (let offset = 1; offset <= 7; offset++) {
      const nextIdx = (dayIdx + offset) % 7;
      if (parsed.openDays[nextIdx]) {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const timeStr = parsed.openTime ? ` ${parsed.openTime}` : "";
        return { isOpen: false, label: `Opens ${dayNames[nextIdx]}${timeStr}` };
      }
    }
    return { isOpen: false, label: "Closed" };
  }

  if (parsed.openTime && parsed.closeTime) {
    const open = parseTime(parsed.openTime);
    const close = parseTime(parsed.closeTime);
    if (open && close) {
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const openMins = open.hours * 60 + open.minutes;
      const closeMins = close.hours * 60 + close.minutes;

      if (nowMins < openMins) {
        return { isOpen: false, label: `Opens ${parsed.openTime}` };
      }
      if (nowMins >= closeMins) {
        return { isOpen: false, label: `Closed · opened till ${parsed.closeTime}` };
      }
      return { isOpen: true, label: `Open · closes ${parsed.closeTime}` };
    }
  }

  return { isOpen: true, label: "Open today" };
}

interface HoursIndicatorProps {
  hours: string;
  className?: string;
}

export default function HoursIndicator({ hours, className }: HoursIndicatorProps) {
  const parsed = useMemo(() => parseHours(hours), [hours]);
  const status = useMemo(() => getOpenStatus(parsed), [parsed]);
  const [expanded, setExpanded] = useState(false);

  const now = new Date();
  const jsDay = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  // 24/7: simple pill only
  if (parsed.is247) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Open 24/7
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {/* Status pill — tappable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 group"
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            status.isOpen
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status.isOpen ? "bg-emerald-500 animate-pulse" : "bg-destructive"
            )}
          />
          {status.label}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <p className="text-xs text-muted-foreground leading-relaxed pl-1">
          {hours}
        </p>
      )}

      {/* Weekly dots */}
      <div className="flex items-center gap-2">
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIdx;
          const isOpen = parsed.openDays[i];
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{label}</span>
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  isOpen ? "bg-primary" : "bg-muted-foreground/20",
                  isToday && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
