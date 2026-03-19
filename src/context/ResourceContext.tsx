import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Resource } from "@/types";
import { seedResources } from "@/data/seed";
import { RESOURCE_SELECT_FIELDS, ResourceRow, normalizeResource, normalizeResourceRows } from "@/lib/resources";
import { isSupabaseConfigured, supabase, supabasePublishableKey, supabaseUrl } from "@/lib/supabase";

const fallbackResources = seedResources.map(normalizeResource);

interface ResourceContextValue {
  resources: Resource[];
  approvedResources: Resource[];
  isLoading: boolean;
  source: "seed" | "supabase";
  errorMessage: string | null;
  getResource: (id: string) => Resource | undefined;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

function formatUnknownError(error: unknown) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const message = Reflect.get(error, "message");
    const details = Reflect.get(error, "details");
    const hint = Reflect.get(error, "hint");
    const code = Reflect.get(error, "code");

    const parts = [message, details, hint, code]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}


async function fetchResourcesViaRest() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase REST fallback is not configured.");
  }

  const params = new URLSearchParams({
    select: RESOURCE_SELECT_FIELDS.replace(/\s+/g, ""),
    status: "eq.approved",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/resources?${params.toString()}`, {
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`REST fallback failed (${response.status}): ${details}`);
  }

  const data = (await response.json()) as ResourceRow[];
  return normalizeResourceRows(data);
}

function renderDebugBadge(source: "seed" | "supabase", count: number) {
  if (typeof document === "undefined") return;

  let badge = document.getElementById("starlight-debug-source");

  if (!badge) {
    badge = document.createElement("div");
    badge.id = "starlight-debug-source";
    badge.style.position = "fixed";
    badge.style.right = "12px";
    badge.style.bottom = "12px";
    badge.style.zIndex = "9999";
    badge.style.padding = "6px 10px";
    badge.style.borderRadius = "999px";
    badge.style.background = "rgba(15, 23, 42, 0.92)";
    badge.style.color = "#fff";
    badge.style.fontSize = "12px";
    badge.style.fontFamily = "monospace";
    badge.style.boxShadow = "0 8px 24px rgba(15, 23, 42, 0.2)";
    document.body.appendChild(badge);
  }

  badge.textContent = `data: ${source} (${count})`;
}

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(isSupabaseConfigured ? [] : fallbackResources);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [source, setSource] = useState<"seed" | "supabase">(isSupabaseConfigured ? "supabase" : "seed");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    renderDebugBadge(source, resources.length);
  }, [resources.length, source]);

  useEffect(() => {
    let isActive = true;

    async function loadResources() {
      if (!supabase) {
        setResources(fallbackResources);
        setSource("seed");
        setErrorMessage(null);
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
        setErrorMessage(null);
      } catch (error) {
        console.warn("Supabase query failed. Trying REST fallback.", error);

        try {
          const fallbackData = await fetchResourcesViaRest();

          if (!isActive) {
            return;
          }

          setResources(fallbackData);
          setSource("supabase");
          setErrorMessage(null);
        } catch (fallbackError) {
          console.warn("Supabase REST fallback also failed.", fallbackError);

          if (!isActive) {
            return;
          }

          setResources([]);
          setSource("supabase");
          setErrorMessage(`${formatUnknownError(error)} || ${formatUnknownError(fallbackError)}`);
        }
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
        errorMessage,
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
