import { useEffect } from "react";
import { Temporal } from "temporal-polyfill";
import { useAuth } from "../contexts/AuthContext";
import { useChores } from "../contexts/ChoresApiContext";
import { Chore } from "./Chore";
import style from "./ChoresList.module.css";

export function ChoresList() {
  const { isAuthenticated } = useAuth();
  const { selectedCalendar, chores, isLoadingChores, loadChores, loadingError, modificationError } =
    useChores();

  useEffect(() => {
    if (!isAuthenticated || !selectedCalendar) return;

    void loadChores();
  }, [isAuthenticated, selectedCalendar, loadChores]);

  if (!isAuthenticated) return null;
  if (!selectedCalendar) return null;

  if (isLoadingChores) return <p>Loading chores…</p>;
  if (loadingError) return <p>Failed to load chores: {loadingError}</p>;
  if (!chores) return null;

  const now = Temporal.Now.instant();

  const choresWithDaysRemaining = chores.map((chore) => {
    const daysRemaining = now.until(chore.dueDate).total("days");
    return { chore, daysRemaining };
  });

  const imminent = choresWithDaysRemaining.filter(({ daysRemaining }) => {
    return daysRemaining <= 7;
  });
  const upcoming = choresWithDaysRemaining.filter(({ daysRemaining }) => {
    return daysRemaining > 7 && daysRemaining <= 30;
  });
  const distant = choresWithDaysRemaining.filter(({ daysRemaining }) => {
    return daysRemaining > 30;
  });

  return (
    <ol className={style["chores-list"]}>
      {modificationError && <li>Failed to update chore: {modificationError}</li>}
      {imminent.map(({ chore, daysRemaining }) => (
        <li
          key={chore.id}
          data-days-remaining={Math.round(daysRemaining)}
          className={[chore.isCompleted() ? style.completed : null].filter(Boolean).join(" ")}
        >
          <Chore chore={chore} />
        </li>
      ))}

      {upcoming.length > 0 && (
        <>
          <li className={style["chores-list-separator"]}>Upcoming</li>
          {upcoming.map(({ chore, daysRemaining }) => (
            <li
              key={chore.id}
              data-days-remaining={Math.round(daysRemaining)}
              className={[chore.isCompleted() ? style.completed : null].filter(Boolean).join(" ")}
            >
              <Chore chore={chore} />
            </li>
          ))}
        </>
      )}

      {distant.length > 0 && (
        <>
          <li className={style["chores-list-separator"]}>Distant</li>
          {distant.map(({ chore, daysRemaining }) => (
            <li
              key={chore.id}
              data-days-remaining={Math.round(daysRemaining)}
              className={[chore.isCompleted() ? style.completed : null].filter(Boolean).join(" ")}
            >
              <Chore chore={chore} />
            </li>
          ))}
        </>
      )}
    </ol>
  );
}
