import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Resource } from "@/types";
import { seedResources } from "@/data/seed";
import { RESOURCE_SELECT_FIELDS, ResourceRow, normalizeResource, normalizeResourceRows } from "@/lib/resources";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const fallbackResources = seedResources.map(normalizeResource);

interface ResourceContextValue {
  resources: Resource[];
  approvedResources: Resource[];
  isLoading: boolean;
  source: "seed" | "supabase";
  getResource: (id: string) => Resource | undefined;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(isSupabaseConfigured ? [] : fallbackResources);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [source, setSource] = useState<"seed" | "supabase">(isSupabaseConfigured ? "supabase" : "seed");

  useEffect(() => {
    let isActive = true;

    async function loadResources() {
      if (!supabase) {
        setResources(fallbackResources);
        setSource("seed");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("resources")
          .select(RESOURCE_SELECT_FIELDS)
          .eq("status", "approved")
          .order("featured", { ascending: false })
          .order("urgency", { ascending: true })
          .order("title", { ascending: true });

        if (error) {
          throw error;
        }

        if (!isActive) {
          return;
        }

        setResources(normalizeResourceRows(data as ResourceRow[]));
        setSource("supabase");
      } catch (error) {
        console.warn("Supabase query failed. Returning an empty resource list instead of seed fallback.", error);
        if (!isActive) {
          return;
        }
        setResources([]);
        setSource("supabase");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadResources();

    return () => {
      isActive = false;
    };
  }, []);

  const approvedResources = useMemo(
    () => resources.filter((resource) => resource.status === "approved"),
    [resources]
  );

  const getResource = useCallback(
    (id: string) => resources.find((resource) => resource.id === id),
    [resources]
  );

  return (
    <ResourceContext.Provider
      value={{
        resources,
        approvedResources,
        isLoading,
        source,
        getResource,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error("useResources must be used within ResourceProvider");
  return ctx;
}
