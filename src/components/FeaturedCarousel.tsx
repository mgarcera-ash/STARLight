import { useRef } from "react";
import { Resource } from "@/types";
import ResourceCard from "./ResourceCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedCarouselProps {
  resources: Resource[];
}

export default function FeaturedCarousel({ resources }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const amount = dir === "left" ? -300 : 300;
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (resources.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold text-foreground">
          ⭐ Featured Resources
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="rounded-full p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {resources.map((r) => (
          <div key={r.id} style={{ scrollSnapAlign: "start" }}>
            <ResourceCard resource={r} size="lg" />
          </div>
        ))}
      </div>
    </section>
  );
}
