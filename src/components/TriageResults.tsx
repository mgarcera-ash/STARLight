import { useMemo } from "react";
import { motion } from "framer-motion";
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
      <motion.button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Change my needs
      </motion.button>

      {/* Active filter chips */}
      <motion.div
        className="flex flex-wrap gap-2 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {needs.map((need) => (
          <Badge key={need} variant="secondary" className="text-xs">
            {need}
          </Badge>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h1 className="text-xl font-bold text-foreground mb-1">
          We found {results.length} resource{results.length !== 1 ? "s" : ""} for you
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Start with the top recommendation below.
        </p>
      </motion.div>

      {/* Priority resource */}
      {priorityResource && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        >
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
        </motion.div>
      )}

      {/* Other results */}
      {otherResources.length > 0 && (
        <div>
          <motion.h2
            className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            More options
          </motion.h2>
          <div className="flex flex-col gap-3">
            {otherResources.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.45 + i * 0.06,
                  ease: "easeOut",
                }}
              >
                <ResourceCard resource={r} size="sm" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-muted-foreground">
            No resources match your selection right now.
          </p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Try different needs
          </Button>
        </motion.div>
      )}
    </div>
  );
}
