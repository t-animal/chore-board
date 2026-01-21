import { type Calendar, type GCalApi, listCalendars } from "chores-lib";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useChores } from "../contexts/ChoresApiContext";
import { loadConfig, storeConfig } from "../lib/storage";

import styles from "./SettingsDialog.module.css";

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { isAuthenticated, logout } = useAuth();
  const {
    gcalApi,
    selectedCalendar,
    selectCalendar: setSelectedCalendar,
    loadChores,
  } = useChores();

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!isAuthenticated) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        onClose();
      }}
    >
      <header className={styles.header}>
        <h2>Settings</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>

      <CalendarSection
        open={open}
        isAuthenticated={isAuthenticated}
        gcalApi={gcalApi}
        selectedCalendar={selectedCalendar}
        onSelectCalendar={setSelectedCalendar}
        onCalendarPersisted={() => {
          void loadChores();
        }}
      />

      <ChoresHistorySection
        open={open}
        onConfigCommitted={() => {
          void loadChores();
        }}
      />

      <AccountSection
        onLogout={() => {
          logout();
          onClose();
        }}
      />
    </dialog>
  );
}

function CalendarSection({
  open,
  isAuthenticated,
  gcalApi,
  selectedCalendar,
  onSelectCalendar,
  onCalendarPersisted,
}: {
  open: boolean;
  isAuthenticated: boolean;
  gcalApi: GCalApi | null;
  selectedCalendar: Calendar | null;
  onSelectCalendar: (calendar: Calendar) => void;
  onCalendarPersisted: () => void;
}) {
  const [calendars, setCalendars] = useState<Calendar[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const cfg = loadConfig();
    const nextSelectedId = cfg.selectedCalendar?.id ?? selectedCalendar?.id ?? "";
    setSelectedId(nextSelectedId);
  }, [open, selectedCalendar?.id]);

  useEffect(() => {
    let cancelled = false;

    if (!open) return;
    if (!isAuthenticated || !gcalApi) return;

    async function load(gcalApi: GCalApi) {
      try {
        setLoadingCalendars(true);
        setCalendarError(null);

        const list = await listCalendars(gcalApi);
        if (cancelled) return;

        setCalendars(list);

        const initialId = selectedCalendar?.id ?? loadConfig().selectedCalendar?.id ?? null;
        if (initialId) {
          const storedCalendar = list.find((c) => c.id === initialId) ?? null;
          if (storedCalendar) {
            setSelectedId(storedCalendar.id);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setCalendarError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoadingCalendars(false);
      }
    }

    void load(gcalApi);

    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, gcalApi, selectedCalendar?.id]);

  return (
    <section className={styles.section}>
      <h3>Calendar</h3>

      {loadingCalendars && <p>Loading calendars…</p>}
      {calendarError && <p>Failed to load calendars: {calendarError}</p>}

      {!loadingCalendars && !calendarError && calendars && calendars.length > 0 && (
        <label>
          Use calendar:{" "}
          <select
            value={selectedId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedId(id);

              const calendar = calendars.find((c) => c.id === id) ?? null;
              if (!calendar) return;

              onSelectCalendar(calendar);

              const current = loadConfig();
              storeConfig({
                ...current,
                selectedCalendar: {
                  id: calendar.id,
                  title: calendar.title,
                },
              });

              onCalendarPersisted();
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
      )}

      {!loadingCalendars && !calendarError && calendars && calendars.length === 0 && (
        <p>No calendars found.</p>
      )}
    </section>
  );
}

function ChoresHistorySection({
  open,
  onConfigCommitted,
}: {
  open: boolean;
  onConfigCommitted: () => void;
}) {
  const [backlogDays, setBacklogDays] = useState<number>(() => loadConfig().backlogTimeSpan);
  const [hideDoneChoresImmediately, setHideDoneChoresImmediately] = useState<boolean>(
    () => loadConfig().cleanUpTime === "immediately",
  );

  const commitBacklogDays = (days: number) => {
    const current = loadConfig();
    if (current.backlogTimeSpan === days) return;
    storeConfig({ ...current, backlogTimeSpan: days });
    onConfigCommitted();
  };

  const commitCleanupTime = (value: boolean) => {
    const current = loadConfig();
    const cleanUpTime = value ? "immediately" : "when-due";
    if (current.cleanUpTime === cleanUpTime) return;
    storeConfig({ ...current, cleanUpTime });
    onConfigCommitted();
  };

  useEffect(() => {
    if (!open) return;
    const cfg = loadConfig();
    setBacklogDays(cfg.backlogTimeSpan);
    setHideDoneChoresImmediately(cfg.cleanUpTime === "immediately");
  }, [open]);

  return (
    <section className={styles.section}>
      <h3>Chores history</h3>
      <label>
        Days back: <strong>{backlogDays}</strong>
        <input
          type="range"
          min={1}
          max={60}
          step={1}
          value={backlogDays}
          onChange={(e) => {
            const days = Number(e.target.value);
            setBacklogDays(days);
          }}
          onPointerUp={() => {
            commitBacklogDays(backlogDays);
          }}
          onKeyUp={() => {
            commitBacklogDays(backlogDays);
          }}
          onBlur={() => {
            commitBacklogDays(backlogDays);
          }}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={hideDoneChoresImmediately}
          onChange={(e) => {
            const value = e.target.checked;
            setHideDoneChoresImmediately(value);
            commitCleanupTime(value);
          }}
        />{" "}
        Hide done chores immediately
      </label>
    </section>
  );
}

function AccountSection({ onLogout }: { onLogout: () => void }) {
  return (
    <section className={styles.section}>
      <h3>Account</h3>
      <button type="button" onClick={onLogout}>
        Logout
      </button>
    </section>
  );
}
