import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    color: "text-primary",
    activeBg: "bg-primary/20 border-primary ring-primary/30",
  },
  {
    category: "Food",
    label: "Food or meals",
    icon: Utensils,
    color: "text-primary",
    activeBg: "bg-primary/20 border-primary ring-primary/30",
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
    color: "text-primary",
    activeBg: "bg-primary/20 border-primary ring-primary/30",
  },
  {
    category: "Community",
    label: "People & support",
    icon: Users,
    color: "text-primary",
    activeBg: "bg-primary/20 border-primary ring-primary/30",
  },
  {
    category: "Internal Programs",
    label: "Workplace programs",
    icon: Building2,
    color: "text-primary",
    activeBg: "bg-primary/20 border-primary ring-primary/30",
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
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-sm font-medium tracking-wide uppercase mb-2">
          <span className="gradient-star-text">STARlight</span>
        </p>
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          What do you need<br />help with?
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Tap all that apply. We'll find the best resources for you.
        </p>
      </motion.div>

      {/* Need cards */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {needOptions.map(({ category, label, icon: Icon, color, activeBg }, index) => {
          const isSelected = selected.includes(category);
          return (
            <motion.button
              key={category}
              onClick={() => toggle(category)}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.15 + index * 0.07,
                ease: "easeOut",
              }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 transition-colors text-center",
                isSelected
                  ? cn(activeBg, "ring-2 border-2 shadow-md")
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-2 right-2 rounded-full bg-primary p-0.5"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Icon
                className={cn("h-8 w-8 transition-colors", isSelected ? color : "text-muted-foreground")}
                strokeWidth={1.5}
              />
              <span
                className={cn(
                  "text-sm font-semibold leading-tight transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
      >
        <Button
          onClick={() => onSubmit(selected)}
          disabled={selected.length === 0}
          className="w-full h-14 text-base font-bold rounded-2xl"
          size="lg"
        >
          Show me my options
        </Button>
      </motion.div>
    </div>
  );
}
