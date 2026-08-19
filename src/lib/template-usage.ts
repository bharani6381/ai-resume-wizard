import { useCallback, useEffect, useState } from "react";
import type { TemplateId } from "@/lib/resume-templates";

const KEY = "resumly:template-usage";

export type UsageMap = Partial<Record<TemplateId, number>>;

function read(): UsageMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as UsageMap) : {};
  } catch {
    return {};
  }
}

/**
 * Tracks how often each template is picked (per browser) so the builder can
 * surface a "Frequently used" shortcut row. Purely presentational — no resume
 * content is touched.
 */
export function useTemplateUsage() {
  const [usage, setUsage] = useState<UsageMap>({});

  // Read after mount to keep SSR output stable.
  useEffect(() => setUsage(read()), []);

  const recordUse = useCallback((id: TemplateId) => {
    setUsage((prev) => {
      const next: UsageMap = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — counts stay in memory */
      }
      return next;
    });
  }, []);

  const frequent = (Object.entries(usage) as Array<[TemplateId, number]>)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return { usage, frequent, recordUse };
}
