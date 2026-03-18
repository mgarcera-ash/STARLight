import { Resource } from "@/types";
import { Share2, Copy, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ShareActions({ resource }: { resource: Resource }) {
  const url = new URL(`${import.meta.env.BASE_URL}resource/${resource.id}`, window.location.origin).toString();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Resource link copied to clipboard." });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print flex gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Copy className="h-4 w-4" />
        Copy Link
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
