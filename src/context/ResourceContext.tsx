import React, { createContext, useContext, useState, useCallback } from "react";
import { Resource, NewResource, Category } from "@/types";
import { seedResources } from "@/data/seed";

interface ResourceContextValue {
  resources: Resource[];
  pendingResources: Resource[];
  returnedResources: Resource[];
  approvedResources: Resource[];
  categories: Category[];
  featuredResources: Resource[];
  submitResource: (r: NewResource) => void;
  approveResource: (id: string) => void;
  returnResource: (id: string, comment: string) => void;
  getResource: (id: string) => Resource | undefined;
  searchResources: (query: string) => Resource[];
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(seedResources);

  const approvedResources = resources.filter((r) => r.status === "approved");
  const pendingResources = resources.filter((r) => r.status === "pending");
  const returnedResources = resources.filter((r) => r.status === "returned");
  const featuredResources = approvedResources.filter((r) => r.featured);

  const categories: Category[] = [
    "Housing",
    "Food",
    "Healthcare",
    "Legal",
    "Community",
    "Internal Programs",
  ];

  const submitResource = useCallback((r: NewResource) => {
    const newRes: Resource = {
      ...r,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setResources((prev) => [...prev, newRes]);
  }, []);

  const approveResource = useCallback((id: string) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" as const, returnComment: undefined } : r
      )
    );
  }, []);

  const returnResource = useCallback((id: string, comment: string) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "returned" as const, returnComment: comment } : r
      )
    );
  }, []);

  const getResource = useCallback(
    (id: string) => resources.find((r) => r.id === id),
    [resources]
  );

  const searchResources = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return approvedResources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.categories.some((c) => c.toLowerCase().includes(q))
      );
    },
    [approvedResources]
  );

  return (
    <ResourceContext.Provider
      value={{
        resources,
        pendingResources,
        returnedResources,
        approvedResources,
        categories,
        featuredResources,
        submitResource,
        approveResource,
        returnResource,
        getResource,
        searchResources,
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
