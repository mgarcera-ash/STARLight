import { Resource } from "@/types";
import { useState } from "react";
import { useResources } from "@/context/ResourceContext";
import { Check, RotateCcw, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ReviewCard({ resource }: { resource: Resource }) {
  const { approveResource, returnResource } = useResources();
  const [comment, setComment] = useState("");
  const [showReturn, setShowReturn] = useState(false);

  const handleApprove = () => {
    approveResource(resource.id);
    toast({ title: "Approved!", description: `"${resource.title}" is now live.` });
  };

  const handleReturn = () => {
    if (!comment.trim()) {
      toast({ title: "Comment required", description: "Please add a comment.", variant: "destructive" });
      return;
    }
    returnResource(resource.id, comment.trim());
    setShowReturn(false);
    setComment("");
    toast({ title: "Returned", description: `"${resource.title}" has been returned with comments.` });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {resource.categories.map((cat) => (
          <span key={cat} className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            {cat}
          </span>
        ))}
        {resource.status === "returned" && (
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
            Returned
          </span>
        )}
      </div>

      <h3 className="font-bold text-foreground mb-1">{resource.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>

      <div className="flex items-center gap-1 text-muted-foreground mb-3">
        <MapPin className="h-3 w-3" />
        <span className="text-[11px] truncate">{resource.location}</span>
      </div>

      {resource.returnComment && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 mb-3">
          <p className="text-xs text-destructive font-medium">Previous comment: {resource.returnComment}</p>
        </div>
      )}

      {showReturn ? (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-lg border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Reason for returning..."
          />
          <div className="flex gap-2">
            <button onClick={handleReturn} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">
              Confirm Return
            </button>
            <button onClick={() => setShowReturn(false)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={() => setShowReturn(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Return
          </button>
        </div>
      )}
    </div>
  );
}
