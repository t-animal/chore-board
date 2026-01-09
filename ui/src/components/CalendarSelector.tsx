import { type Calendar, type GCalApi, listCalendars } from "chores-lib";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useChores } from "../contexts/ChoresApiContext";
import { loadConfig, storeConfig } from "../lib/storage";

export function CalendarSelector() {
  const { isAuthenticated } = useAuth();
  const { gcalApi, selectedCalendar, setSelectedCalendar } = useChores();

  const [calendars, setCalendars] = useState<Calendar[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storedCalendarId = useMemo(() => loadConfig().selectedCalendar, []);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || !gcalApi) return;

    async function loadCalendars(gcalApi: GCalApi) {
      try {
        setLoading(true);
        setError(null);

        const list = await listCalendars(gcalApi);
        if (cancelled) return;

        setCalendars(list);

        if (storedCalendarId) {
          const storedCalendar = list.find((c) => c.id === storedCalendarId) ?? null;
          if (storedCalendar) {
            setSelectedCalendar(storedCalendar);
            setSelectedId(storedCalendar.id);
            return;
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    void loadCalendars(gcalApi);

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, gcalApi, setSelectedCalendar, storedCalendarId]);

  if (!isAuthenticated) return null;
  if (selectedCalendar) return null;
  if (loading) return <p>Loading calendars…</p>;

  if (error) {
    return <p>Failed to load calendars: {error}</p>;
  }

  if (!calendars || calendars.length === 0) {
    return <p>No calendars found.</p>;
  }

  return (
    <div>
      <label>
        Calendar:{" "}
        <select
          value={selectedId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedId(id);

            const calendar = calendars.find((c) => c.id === id) ?? null;
            if (!calendar) return;

            setSelectedCalendar(calendar);

            const current = loadConfig();
            storeConfig({ ...current, selectedCalendar: id });
          }}
        >
          <option value="" disabled>
            Select a calendar…
          </option>
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
