import { useParams, Link } from "react-router-dom";
import { useResources } from "@/context/ResourceContext";
import ResourceInfo from "@/components/ResourceInfo";
import ShareActions from "@/components/ShareActions";
import { ArrowLeft, Home, Utensils, HeartPulse, Scale, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryHero: Record<string, { icon: React.ElementType; tone: string; badge: string }> = {
  Housing: { icon: Home, tone: "bg-primary/8 text-primary", badge: "Housing" },
  Food: { icon: Utensils, tone: "bg-accent/12 text-accent", badge: "Food" },
  Healthcare: { icon: HeartPulse, tone: "bg-primary/10 text-primary", badge: "Healthcare" },
  Legal: { icon: Scale, tone: "bg-star-purple/10 text-star-purple", badge: "Legal" },
  Community: { icon: Users, tone: "bg-star-blue/10 text-star-blue", badge: "Community" },
  "Internal Programs": { icon: Building2, tone: "bg-star-gold/15 text-accent", badge: "Internal Programs" },
};

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const { getResource, isLoading } = useResources();
  const resource = id ? getResource(id) : undefined;

  if (isLoading && !resource) {
    return (
      <div className="page-ambient flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">Loading resource details...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="page-ambient flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Resource not found.</p>
          <Link to="/" className="font-semibold text-primary">← Back</Link>
        </div>
      </div>
    );
  }

  const primaryCat = resource.categories[0] || "Housing";
  const hero = categoryHero[primaryCat] || categoryHero.Housing;
  const HeroIcon = hero.icon;

  return (
    <div className="page-ambient min-h-screen pb-24">
      <div className="no-print px-4 pt-6 pb-4">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-border bg-card px-5 py-5 shadow-sm">
          <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="mb-4 flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", hero.tone)}>
              <HeroIcon className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {hero.badge}
            </span>
          </div>
          <h1 className="text-2xl font-black leading-tight text-foreground">
            {resource.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pt-5 print-flyer">
        <ResourceInfo resource={resource} />
        <div className="mt-8">
          <ShareActions resource={resource} />
        </div>
      </div>
    </div>
  );
}
