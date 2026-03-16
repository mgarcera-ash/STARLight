import { useMemo } from "react";
import { Category } from "@/types";
import { useResources } from "@/context/ResourceContext";
import ResourceCard from "@/components/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { Link } from "react-router-dom";


interface TriageResultsProps {
  needs: Category[];
  onBack: () => void;
}

export default function TriageResults({ needs, onBack }: TriageResultsProps) {
  const { approvedResources } = useResources();

  const results = useMemo(() => {
    const matched = approvedResources.filter((r) =>
      r.categories.some((c) => needs.includes(c))
    );
    return matched.sort((a, b) => a.urgency - b.urgency);
  }, [approvedResources, needs]);

  const priorityResource = results[0];
  const otherResources = results.slice(1);

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-24">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Change my needs
      </button>

      {/* Active filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {needs.map((need) => (
          <Badge key={need} variant="secondary" className="text-xs">
            {need}
          </Badge>
        ))}
      </div>

      <h1 className="text-xl font-bold text-foreground mb-1">
        We found {results.length} resource{results.length !== 1 ? "s" : ""} for you
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Start with the top recommendation below.
      </p>

      {/* Priority resource */}
      {priorityResource && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="h-4 w-4 text-star-gold fill-star-gold" />
            <span className="text-xs font-bold text-star-gold uppercase tracking-wide">
              Start here
            </span>
          </div>
          <Link
            to={`/resource/${priorityResource.id}`}
            className="block rounded-2xl border-2 border-primary/40 bg-primary/5 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <ResourceCard resource={priorityResource} size="lg" asDiv />
          </Link>
        </div>
      )}

      {/* Other results */}
      {otherResources.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            More options
          </h2>
          <div className="flex flex-col gap-3">
            {otherResources.map((r) => (
              <ResourceCard key={r.id} resource={r} size="sm" />
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No resources match your selection right now.
          </p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Try different needs
          </Button>
        </div>
      )}
    </div>
  );
}
