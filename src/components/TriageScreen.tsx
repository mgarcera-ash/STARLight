import { useState } from "react";
import { Category } from "@/types";
import { Home, Utensils, HeartPulse, Scale, Users, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NeedOption {
  category: Category;
  label: string;
  icon: React.ElementType;
  color: string;
  activeBg: string;
}

const needOptions: NeedOption[] = [
  {
    category: "Housing",
    label: "A place to stay",
    icon: Home,
    color: "text-secondary",
    activeBg: "bg-secondary/20 border-secondary ring-secondary/30",
  },
  {
    category: "Food",
    label: "Food or meals",
    icon: Utensils,
    color: "text-accent",
    activeBg: "bg-accent/20 border-accent ring-accent/30",
  },
  {
    category: "Healthcare",
    label: "Medical or health care",
    icon: HeartPulse,
    color: "text-primary",
    activeBg: "bg-primary/20 border-primary ring-primary/30",
  },
  {
    category: "Legal",
    label: "Legal help",
    icon: Scale,
    color: "text-star-purple",
    activeBg: "bg-star-purple/20 border-star-purple ring-star-purple/30",
  },
  {
    category: "Community",
    label: "People & support",
    icon: Users,
    color: "text-star-blue",
    activeBg: "bg-star-blue/20 border-star-blue ring-star-blue/30",
  },
  {
    category: "Internal Programs",
    label: "Workplace programs",
    icon: Building2,
    color: "text-star-gold",
    activeBg: "bg-star-gold/20 border-star-gold ring-star-gold/30",
  },
];

interface TriageScreenProps {
  onSubmit: (needs: Category[]) => void;
}

export default function TriageScreen({ onSubmit }: TriageScreenProps) {
  const [selected, setSelected] = useState<Category[]>([]);

  const toggle = (cat: Category) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-5 pt-12 pb-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-primary tracking-wide uppercase mb-2">
          STARlight
        </p>
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          What do you need<br />help with?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Tap all that apply — we'll find the best resources for you.
        </p>
      </div>

      {/* Need cards */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {needOptions.map(({ category, label, icon: Icon, color, activeBg }) => {
          const isSelected = selected.includes(category);
          return (
            <button
              key={category}
              onClick={() => toggle(category)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 transition-all text-center",
                isSelected
                  ? cn(activeBg, "ring-2 border-2 shadow-md")
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <Icon
                className={cn("h-8 w-8", isSelected ? color : "text-muted-foreground")}
                strokeWidth={1.5}
              />
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Button
          onClick={() => onSubmit(selected)}
          disabled={selected.length === 0}
          className="w-full h-14 text-base font-bold rounded-2xl"
          size="lg"
        >
          Show me my options
        </Button>
      </div>
    </div>
  );
}
