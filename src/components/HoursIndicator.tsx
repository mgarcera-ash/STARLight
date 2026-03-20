import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const DAY_MAP: Record<string, number> = {
  sun: 6, mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5,
};

interface ParsedHours {
  is247: boolean;
  openDays: boolean[];
  openTime: string | null;
  closeTime: string | null;
  raw: string;
}

function parseDayRange(start: string, end: string): number[] {
  const s = DAY_MAP[start.toLowerCase().slice(0, 3)];
  const e = DAY_MAP[end.toLowerCase().slice(0, 3)];
  if (s === undefined || e === undefined) return [];
  const days: number[] = [];
  for (let i = s; i <= e; i++) days.push(i);
  if (e < s) for (let i = s; i <= 6; i++) days.push(i);
  return days;
}

export function parseHours(hours: string): ParsedHours {
  const h = hours.toLowerCase();
  const openDays = Array(7).fill(false) as boolean[];

  if (/(?:24\s*\/\s*7|24\s*-\s*hour|24\s*hours?|24\s*hrs?|24hr)\b/.test(h)) {
    return { is247: true, openDays: Array(7).fill(true), openTime: null, closeTime: null, raw: hours };
  }

  if (h.includes("daily")) {
    return { is247: false, openDays: Array(7).fill(true), openTime: null, closeTime: null, raw: hours };
  }

  let firstOpen: string | null = null;
  let firstClose: string | null = null;
  const segments = hours.split(",").map((s) => s.trim());

  for (const seg of segments) {
    const rangeMatch = seg.match(/(\w{3})\s*[–-]\s*(\w{3})/i);
    const individualMatch = seg.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/gi);
    const timeMatch = seg.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);

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

export function getOpenStatus(parsed: ParsedHours): { isOpen: boolean; label: string } {
  if (parsed.is247) return { isOpen: true, label: "Open 24/7" };

  const now = new Date();
  const jsDay = now.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const isOpenDay = parsed.openDays[dayIdx];

  if (!isOpenDay) {
    for (let offset = 1; offset <= 7; offset++) {
      const nextIdx = (dayIdx + offset) % 7;
      if (parsed.openDays[nextIdx]) {
        const timeStr = parsed.openTime ? ` ${parsed.openTime}` : "";
        return { isOpen: false, label: `Opens ${DAY_NAMES[nextIdx]}${timeStr}` };
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

      if (nowMins < openMins) return { isOpen: false, label: `Opens ${parsed.openTime}` };
      if (nowMins >= closeMins) return { isOpen: false, label: `Closed · opened till ${parsed.closeTime}` };
      return { isOpen: true, label: `Open · closes ${parsed.closeTime}` };
    }
  }

  return { isOpen: true, label: "Open today" };
}

interface HoursIndicatorProps {
  hours: string;
  className?: string;
}

function getDayDetail(parsed: ParsedHours, dayIdx: number) {
  const dayName = DAY_NAMES[dayIdx];

  if (parsed.is247) return `${dayName} · 24 hours`;
  if (!parsed.openDays[dayIdx]) return `${dayName} · Closed`;
  if (parsed.openTime && parsed.closeTime) return `${dayName} · ${parsed.openTime} - ${parsed.closeTime}`;
  if (parsed.openTime) return `${dayName} · Opens ${parsed.openTime}`;
  return `${dayName} · Open`;
}

export default function HoursIndicator({ hours, className }: HoursIndicatorProps) {
  const parsed = useMemo(() => parseHours(hours), [hours]);
  const now = new Date();
  const jsDay = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start justify-between gap-2">
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIdx;
          const isSelected = i === selectedDay;
          const isOpenDay = parsed.is247 || parsed.openDays[i];

          const detail = getDayDetail(parsed, i);

          return (
            <Popover
              key={`${label}-${i}`}
              open={isSelected}
              onOpenChange={(open) => setSelectedDay(open ? i : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-1 transition-colors"
                  aria-label={detail}
                >
                  <span className={cn(
                    "text-[11px] font-medium",
                    isToday ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full border transition-all",
                      isOpenDay
                        ? "border-primary/20 bg-primary"
                        : "border-rose-200 bg-rose-500",
                      isSelected && "scale-110 ring-2 ring-foreground/10 ring-offset-2 ring-offset-card",
                      isToday && !isSelected && "ring-2 ring-primary/20 ring-offset-2 ring-offset-card"
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                sideOffset={10}
                className="w-auto rounded-2xl border-border/70 bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              >
                {detail}
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
