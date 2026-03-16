import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SubmissionForm from "@/components/SubmissionForm";

export default function SubmitResource() {
  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Browse
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-1">Submit a Resource</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Help grow the STARLight library. Your submission will be reviewed before going live.
        </p>
        <SubmissionForm />
      </div>
    </div>
  );
}
