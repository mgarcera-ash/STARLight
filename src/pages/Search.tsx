import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useResources } from "@/context/ResourceContext";
import ResourceCard from "@/components/ResourceCard";
import { Search, ArrowLeft } from "lucide-react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { searchResources } = useResources();
  const [results, setResults] = useState(
    initialQuery ? searchResources(initialQuery) : []
  );

  useEffect(() => {
    if (query.trim()) {
      setResults(searchResources(query.trim()));
      setSearchParams({ q: query.trim() });
    } else {
      setResults([]);
    }
  }, [query, searchResources, setSearchParams]);

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Browse
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-4">Search</h1>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources, tags, categories..."
            autoFocus
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {query.trim() && (
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </p>
        )}

        <div className="grid gap-3">
          {results.map((r) => (
            <ResourceCard key={r.id} resource={r} size="lg" />
          ))}
        </div>

        {query.trim() && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found.</p>
            <p className="text-sm text-muted-foreground mt-1">Try different keywords or browse categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
