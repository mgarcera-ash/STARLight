import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useResources } from "@/context/ResourceContext";
import ReviewCard from "@/components/ReviewCard";

export default function ReviewQueue() {
  const { pendingResources, returnedResources } = useResources();
  const allReviewable = [...pendingResources, ...returnedResources];

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Browse
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-1">Review Queue</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {allReviewable.length} submission{allReviewable.length !== 1 ? "s" : ""} pending review.
        </p>

        {allReviewable.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No submissions to review.</p>
            <p className="text-sm text-muted-foreground mt-1">All clear! 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allReviewable.map((r) => (
              <ReviewCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
