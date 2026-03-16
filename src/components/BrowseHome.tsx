import { useResources } from "@/context/ResourceContext";
import FeaturedCarousel from "./FeaturedCarousel";
import CategoryRow from "./CategoryRow";
import SearchBar from "./SearchBar";

export default function BrowseHome() {
  const { approvedResources, featuredResources, categories } = useResources();

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
