import type { Chore as ChoreItem } from "chores-lib";
import { useEffect, useState } from "react";
import { Temporal } from "temporal-polyfill";
import { useAuth } from "../contexts/AuthContext";
import { useChores } from "../contexts/ChoresApiContext";
import { loadConfig } from "../lib/storage";
import { Chore } from "./Chore";
import style from "./ChoresList.module.css";

export function ChoresList() {
  const { isAuthenticated } = useAuth();
  const { choresApi, selectedCalendar } = useChores();

  const [chores, setChores] = useState<ChoreItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || !choresApi || !selectedCalendar) return;

    const loadChores = async () => {
      setLoading(true);
      setError(null);

      const { backlogTimeSpan } = loadConfig();
      const items = await choresApi.getChores(backlogTimeSpan, 180, 80);
      if (cancelled) return;

      setChores(items);
    };

    void loadChores()
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, choresApi, selectedCalendar]);

  if (!isAuthenticated) return null;
  if (!selectedCalendar) return null;

  if (loading) return <p>Loading chores…</p>;
  if (error) return <p>Failed to load chores: {error}</p>;
  if (!chores) return null;

  const now = Temporal.Now.instant();

  const imminent = chores.filter((chore) => {
    return now.until(chore.dueDate).total("days") <= 7;
  });
  const upcoming = chores.filter((chore) => {
    const daysRemaining = now.until(chore.dueDate).total("days");
    return daysRemaining > 7 && daysRemaining <= 30;
  });
  const distant = chores.filter((chore) => {
    return now.until(chore.dueDate).total("days") > 30;
  });

  return (
    <ol className={style["chores-list"]}>
      {imminent.map((chore) => (
        <li key={chore.id}>
          <Chore chore={chore} />
        </li>
      ))}

      {upcoming.length > 0 && (
        <>
          <li className={style["chores-list-separator"]}>Upcoming</li>
          {upcoming.map((chore) => (
            <li key={chore.id}>
              <Chore chore={chore} />
            </li>
          ))}
        </>
      )}

      {distant.length > 0 && (
        <>
          <li className={style["chores-list-separator"]}>Distant</li>
          {distant.map((chore) => (
            <li key={chore.id}>
              <Chore chore={chore} />
            </li>
          ))}
        </>
      )}
    </ol>
  );
}
