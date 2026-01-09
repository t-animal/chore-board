import "../../types/GoogleServices.d.ts";

import { type Calendar, ChoresApi, type GCalApi, getGcalApi } from "chores-lib";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "./AuthContext.tsx";
import { getClientId } from "./ClientId.ts";

type ChoresContextValue = {
  gcalApi: GCalApi | null;
  selectedCalendar: Calendar | null;
  setSelectedCalendar: (calendar: Calendar | null) => void;
  choresApi: ChoresApi | null;
};

const ChoresContext = createContext<ChoresContextValue | null>(null);

export function ChoresApiProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [gcalApi, setGcalApi] = useState<GCalApi | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [choresApi, setChoresApi] = useState<ChoresApi | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setGcalApi(null);
      setChoresApi(null);
      setSelectedCalendar(null);
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!gcalApi || !selectedCalendar) {
      setChoresApi(null);
      return;
    }
    setChoresApi(new ChoresApi(gcalApi, selectedCalendar.title));
  }, [gcalApi, selectedCalendar]);

  const value = useMemo<ChoresContextValue>(
    () => ({
      gcalApi,
      selectedCalendar,
      setSelectedCalendar,
      choresApi,
    }),
    [gcalApi, selectedCalendar, choresApi],
  );

  return <ChoresContext.Provider value={value}>{children}</ChoresContext.Provider>;
}

export function useChores(): ChoresContextValue {
  const ctx = useContext(ChoresContext);
  if (!ctx) {
    throw new Error("useChores must be used within <ChoresProvider>");
  }
  return ctx;
}
