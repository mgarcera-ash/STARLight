import { useParams, Link } from "react-router-dom";
import { useResources } from "@/context/ResourceContext";
import ResourceInfo from "@/components/ResourceInfo";
import ShareActions from "@/components/ShareActions";
import { ArrowLeft, Home, Utensils, HeartPulse, Scale, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryHero: Record<string, { icon: React.ElementType; gradient: string }> = {
  Housing: { icon: Home, gradient: "from-secondary to-secondary/70" },
  Food: { icon: Utensils, gradient: "from-accent to-accent/70" },
  Healthcare: { icon: HeartPulse, gradient: "from-primary to-star-blue" },
  Legal: { icon: Scale, gradient: "from-star-purple to-secondary" },
  Community: { icon: Users, gradient: "from-star-blue to-primary" },
  "Internal Programs": { icon: Building2, gradient: "from-star-gold to-accent" },
};

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const { getResource } = useResources();
  const resource = id ? getResource(id) : undefined;

  if (!resource) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Resource not found.</p>
          <Link to="/" className="text-primary font-semibold">← Back to Browse</Link>
        </div>
      </div>
    );
  }

  const primaryCat = resource.categories[0] || "Housing";
  const hero = categoryHero[primaryCat] || categoryHero.Housing;
  const HeroIcon = hero.icon;

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className={cn("no-print bg-gradient-to-br px-4 pt-6 pb-10 relative overflow-hidden", hero.gradient)}>
        {/* Large decorative icon */}
        <HeroIcon
          className="absolute right-[-20px] bottom-[-10px] h-40 w-40 text-primary-foreground/10"
          strokeWidth={0.8}
        />
        <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/80 text-sm mb-4 hover:text-primary-foreground transition-colors relative z-10">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex flex-wrap gap-1.5 mb-2 relative z-10">
          {resource.categories.map((cat) => (
            <span key={cat} className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
              {cat}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-black text-primary-foreground leading-tight relative z-10">
          {resource.title}
        </h1>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 print-flyer">
        <ResourceInfo resource={resource} />
        <div className="mt-8">
          <ShareActions resource={resource} />
        </div>
      </div>
    </div>
  );
}
