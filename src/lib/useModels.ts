import { useState, useEffect, useCallback } from 'react';
import { fetchFreeModels, type FreeModel } from './api';

const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export interface ModelWithStatus extends FreeModel {
  online: boolean;
}

function isModelOnline(m: FreeModel): boolean {
  // Backend already filters — but double-check supported_parameters
  const params = m.supported_parameters ?? [];
  return params.length > 0 && params.includes('temperature');
}

export function useModels() {
  const [models, setModels] = useState<ModelWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const sync = useCallback(async () => {
    try {
      const fresh = await fetchFreeModels();
      const freshIds = new Set(fresh.map(m => m.id));

      setModels(prev => {
        const prevMap = new Map(prev.map(m => [m.id, m]));
        const merged = new Map<string, ModelWithStatus>();

        // Keep known models, mark online status
        prevMap.forEach((m, id) => {
          merged.set(id, { ...m, online: freshIds.has(id) && isModelOnline(m) });
        });

        // Add new models from API
        fresh.forEach(m => {
          merged.set(m.id, { ...m, online: isModelOnline(m) });
        });

        // Sort: online first, then alphabetical
        return Array.from(merged.values()).sort((a, b) => {
          if (a.online !== b.online) return a.online ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      });

      setError(null);
      setLastSynced(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      // Mark all existing models as offline on error
      setModels(prev => prev.map(m => ({ ...m, online: false })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    sync();
    const interval = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sync]);

  return { models, loading, error, lastSynced, sync };
}
