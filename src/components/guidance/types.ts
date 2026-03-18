import { Resource } from "@/types";

export interface Tile {
  key: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  external?: boolean;
}

export const PEER_NAVIGATOR_PHONE = "(215) 555-0106";

export const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export function stagger(delay: number) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  };
}

export function getMapsUrl(location: string, hasCoords: boolean) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}${hasCoords ? "&travelmode=transit" : ""}`;
}

export function isConfidentialLocation(location: string): boolean {
  const l = location.toLowerCase();
  return l.includes("confidential") || l.includes("phone/text") || l.includes("phone-based") || l.includes("text-based");
}
