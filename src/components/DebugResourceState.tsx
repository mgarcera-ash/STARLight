import { useResources } from "@/context/ResourceContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function DebugResourceState() {
  const { resources, approvedResources, isLoading, source } = useResources();

  return (
    <div className="fixed left-3 top-3 z-[9999] rounded-xl bg-slate-950/90 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
      <div>cfg: {isSupabaseConfigured ? "supabase" : "missing"}</div>
      <div>src: {source}</div>
      <div>all: {resources.length}</div>
      <div>approved: {approvedResources.length}</div>
      <div>loading: {isLoading ? "yes" : "no"}</div>
      <div>base: {import.meta.env.BASE_URL}</div>
    </div>
  );
}
