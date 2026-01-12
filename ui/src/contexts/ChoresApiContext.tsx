import "../../types/GoogleServices.d.ts";

import {
  type Calendar,
  type Chore as ChoreItem,
  ChoresApi,
  type GCalApi,
  getGcalApi,
} from "chores-lib";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadConfig } from "../lib/storage";
import { useAuth } from "./AuthContext.tsx";
import { getClientId } from "./ClientId.ts";

type ChoresContextValue = {
  gcalApi: GCalApi | null;

  selectCalendar: (calendar: Calendar | null) => void;
  selectedCalendar: Calendar | null;

  loadChores: () => Promise<void>;
  chores: ChoreItem[] | null;
  isLoadingChores: boolean;

  toggleChoreDone: (choreId: string) => Promise<ChoreItem>;
  choresLockedForModification: ReadonlySet<string>;

  loadingError: string | null;
  modificationError: string | null;
};

const ChoresContext = createContext<ChoresContextValue | null>(null);

export function ChoresApiProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [gcalApi, setGcalApi] = useState<GCalApi | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [choresApi, setChoresApi] = useState<ChoresApi | null>(null);

  const [chores, setChores] = useState<ChoreItem[] | null>(null);
  const [isLoadingChores, setIsLoadingChores] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [modificationError, setModificationError] = useState<string | null>(null);
  const [choresLockedForModification, setChoresLockedForModification] = useState<
    ReadonlySet<string>
  >(() => new Set());

  const choresRef = useRef<ChoreItem[] | null>(null);
  useEffect(() => {
    choresRef.current = chores;
  }, [chores]);

  const loadRunIdRef = useRef(0);

  const resetChoresState = useCallback(() => {
    loadRunIdRef.current += 1;
    setChores(null);
    setIsLoadingChores(false);
    setLoadingError(null);
    setModificationError(null);
    setChoresLockedForModification(new Set());
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setGcalApi(null);
      setChoresApi(null);
      setSelectedCalendar(null);

      resetChoresState();
      return;
    }

    const initGcalApi = async () => {
      await window.googleApisLoaded;
      const clientId = getClientId();
      const api = await getGcalApi({ clientId }, "browser");
      if (cancelled) return;
      setGcalApi(api);
    };

    void initGcalApi().catch((err) => {
      console.error(err);
      if (cancelled) return;
      setGcalApi(null);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, resetChoresState]);

  useEffect(() => {
    if (!gcalApi || !selectedCalendar) {
      setChoresApi(null);
      return;
    }
    setChoresApi(new ChoresApi(gcalApi, selectedCalendar.id));
  }, [gcalApi, selectedCalendar]);

  const selectCalendar = useCallback(
    (calendar: Calendar | null) => {
      resetChoresState();
      setSelectedCalendar(calendar);
    },
    [resetChoresState],
  );

  const loadChores = useCallback(async () => {
    if (!isAuthenticated || !choresApi || !selectedCalendar) return;

    loadRunIdRef.current += 1;
    const runId = loadRunIdRef.current;
    setIsLoadingChores(true);
    setLoadingError(null);

    try {
      const { backlogTimeSpan } = loadConfig();
      const items = await choresApi.getChores(backlogTimeSpan, 180, 80);
      if (runId === loadRunIdRef.current) {
        setChores(items);
      }
    } catch (err) {
      if (runId === loadRunIdRef.current) {
        setLoadingError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      if (runId === loadRunIdRef.current) {
        setIsLoadingChores(false);
      }
    }
  }, [isAuthenticated, choresApi, selectedCalendar]);

  const toggleChoreDone = useCallback(
    async (choreId: string) => {
      if (!isAuthenticated || !choresApi || !selectedCalendar) {
        const err = new Error("Chores API not initialized");
        setModificationError(err.message);
        throw err;
      }

      if (choresLockedForModification.has(choreId)) {
        const err = new Error("Chore is currently locked for modification");
        setModificationError(err.message);
        throw err;
      }

      const currentChore = choresRef.current?.find((c) => c.id === choreId) ?? null;
      if (!currentChore) {
        const err = new Error("Chore not found");
        setModificationError(err.message);
        throw err;
      }

      setModificationError(null);
      setChoresLockedForModification((prev) => {
        const next = new Set(prev);
        next.add(choreId);
        return next;
      });

      try {
        const updated = currentChore.isCompleted()
          ? await choresApi.markChoreIncomplete(choreId)
          : await choresApi.markChoreComplete(choreId);

        setChores((prev) => {
          if (!prev) return prev;
          let didReplace = false;
          const next = prev.map((c) => {
            if (c.id !== updated.id) return c;
            didReplace = true;
            return updated;
          });
          return didReplace ? next : prev;
        });

        return updated;
      } catch (err) {
        setModificationError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setChoresLockedForModification((prev) => {
          const next = new Set(prev);
          next.delete(choreId);
          return next;
        });
      }
    },
    [isAuthenticated, choresApi, selectedCalendar, choresLockedForModification],
  );

  const value = useMemo<ChoresContextValue>(
    () => ({
      gcalApi,
      selectCalendar,
      selectedCalendar,
      loadChores,
      chores,
      isLoadingChores,
      toggleChoreDone,
      choresLockedForModification,
      loadingError,
      modificationError,
    }),
    [
      gcalApi,
      selectCalendar,
      selectedCalendar,
      loadChores,
      chores,
      isLoadingChores,
      toggleChoreDone,
      choresLockedForModification,
      loadingError,
      modificationError,
    ],
  );

  return <ChoresContext.Provider value={value}>{children}</ChoresContext.Provider>;
}

export function useChores(): ChoresContextValue {
  const ctx = useContext(ChoresContext);
  if (!ctx) {
    throw new Error("useChores must be used within <ChoresApiProvider>");
  }
  return ctx;
}
