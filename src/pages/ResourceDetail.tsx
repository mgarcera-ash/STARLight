import { useParams, Link } from "react-router-dom";
import { useResources } from "@/context/ResourceContext";
import ResourceInfo from "@/components/ResourceInfo";
import ShareActions from "@/components/ShareActions";
import { ArrowLeft } from "lucide-react";

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

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="no-print gradient-star px-4 pt-6 pb-4">
        <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/80 text-sm mb-3 hover:text-primary-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {resource.categories.map((cat) => (
            <span key={cat} className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
              {cat}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-black text-primary-foreground leading-tight">
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
