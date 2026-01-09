import type { Chore as ChoreItem } from "chores-lib";

import { Temporal } from "temporal-polyfill";

import style from "./Chore.module.css";

export function Chore({ chore }: { chore: ChoreItem }) {
  const { title, description, dueDate } = chore;

  const classList = [style.chore];
  if (chore.isPastDue()) {
    classList.push(style["past-due"]);
  }

  if (chore.isDueToday()) {
    classList.push(style["due-today"]);
  }

  if (chore.isCompleted()) {
    classList.push(style["completed"]);
  }

  return (
    <section className={classList.join(" ")}>
      <h2 style={{ color: chore.color?.background ?? "inherit" }}>{title}</h2>
      <div className={style["description"]}>{description}</div>
      <aside className={style["due-date"]}>
        {formatRelativeDurationDaysHours(dueDate.since(Temporal.Now.instant()))}
      </aside>
    </section>
  );
}

function formatRelativeDurationDaysHours(duration: Temporal.Duration): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "always" });

  let totalHours = duration.total({ unit: "hours" });

  if (Object.is(totalHours, -0)) totalHours = 0;

  const absHours = Math.abs(totalHours);
  const sign = Math.sign(totalHours);

  if (absHours >= 24) {
    let days = Math.round(totalHours / 24);
    if (days === 0 && sign !== 0) days = sign;
    return rtf.format(days, "day");
  }

  let hours = Math.round(totalHours);
  if (hours === 0 && sign !== 0) hours = sign;
  return rtf.format(hours, "hour");
}
