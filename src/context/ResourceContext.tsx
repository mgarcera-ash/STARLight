import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Resource } from "@/types";
import { ResourceRow, normalizeResourceRows } from "@/lib/resources";

interface ResourceContextValue {
  resources: Resource[];
  approvedResources: Resource[];
  isLoading: boolean;
  getResource: (id: string) => Resource | undefined;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

const resourceSnapshotUrl = `${import.meta.env.BASE_URL}resources.json`;

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadResources() {
      try {
        const response = await fetch(resourceSnapshotUrl, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Snapshot request failed (${response.status})`);
        }

        const data = (await response.json()) as ResourceRow[];

        if (!isActive) {
          return;
        }

        setResources(normalizeResourceRows(data));
      } catch (error) {
        console.warn("Failed to load static resource snapshot.", error);

        if (!isActive) {
          return;
        }

        setResources([]);
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
