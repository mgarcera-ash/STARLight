import { useResources } from "@/context/ResourceContext";
import { useNavigate } from "react-router-dom";
import FeaturedCarousel from "./FeaturedCarousel";
import CategoryRow from "./CategoryRow";
import SearchBar from "./SearchBar";
import { Home, Utensils, HeartPulse, Scale, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const quickAccess = [
  { label: "Housing", icon: Home, color: "bg-secondary text-secondary-foreground" },
  { label: "Food", icon: Utensils, color: "bg-accent text-accent-foreground" },
  { label: "Healthcare", icon: HeartPulse, color: "bg-primary text-primary-foreground" },
  { label: "Legal", icon: Scale, color: "bg-star-purple text-primary-foreground" },
  { label: "Community", icon: Users, color: "bg-star-blue text-primary-foreground" },
  { label: "Internal Programs", icon: Building2, color: "bg-star-gold text-foreground" },
];

export default function BrowseHome() {
  const { approvedResources, featuredResources, categories } = useResources();
  const navigate = useNavigate();

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-star px-4 pt-6 pb-8 mb-6">
        <h1 className="text-2xl font-black text-primary-foreground tracking-tight">
          STARLight
        </h1>
        <p className="text-primary-foreground/80 text-sm mt-1">
          Discover resources. Build connections.
        </p>
      </div>

      <SearchBar />

      {/* Quick Access Grid */}
      <section className="px-4 mb-8">
        <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
          Quick Access
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {quickAccess.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              onClick={() => navigate(`/search?q=${encodeURIComponent(label)}`)}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className={cn("rounded-full p-3", color)}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <FeaturedCarousel resources={featuredResources} />

      {categories.map((cat) => {
        const catResources = approvedResources.filter((r) =>
          r.categories.includes(cat)
        );
        return (
          <CategoryRow key={cat} title={cat} resources={catResources} />
        );
      })}
    </div>
  );
}
