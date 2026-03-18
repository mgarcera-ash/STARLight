import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { Resource } from "@/types";
import { seedResources } from "@/data/seed";
import { normalizeResource } from "@/lib/resources";

interface ResourceContextValue {
  resources: Resource[];
  approvedResources: Resource[];
  getResource: (id: string) => Resource | undefined;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources] = useState<Resource[]>(() => seedResources.map(normalizeResource));

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
