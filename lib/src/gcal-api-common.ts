import type { calendar_v3 } from "googleapis";
import { Temporal } from "temporal-polyfill";

export type Calendar = {
  id: string;
  title: string;
};

export type CalendarEvent = {
  id: string;
  summary: string;
  start: Temporal.Instant;
  end: Temporal.Instant;
};

export type Result<T, E = unknown> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Result = {
  ok<T>(data: T): Result<T> {
    return { success: true, data };
  },
  error<E>(error: E): Result<never, E> {
    return { success: false, error };
  },
};

export interface GCalApi {
  listCalendars(): Promise<Calendar[]>;

  createCalendar(name: string): Promise<Result<Calendar>>;

  listEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string,
    maxResults?: number,
  ): Promise<CalendarEvent[]>;

  patchEvent(
    calendarId: string,
    eventId: string,
    prefix: string,
    action: "prepend" | "remove",
  ): Promise<Result<CalendarEvent>>;
}

export function parseEvent({
  id,
  summary,
  start,
  end,
}:
  | calendar_v3.Schema$Event
  | gapi.client.calendar.Event): CalendarEvent | null {
  if (!id || !summary || !start?.dateTime || !end?.dateTime) {
    return null;
  }
  return {
    id,
    summary,
    start: Temporal.Instant.from(start.dateTime),
    end: Temporal.Instant.from(end.dateTime),
  };
}

export function parseCalendar({
  id,
  summary,
}:
  | calendar_v3.Schema$CalendarListEntry
  | gapi.client.calendar.CalendarListEntry
  | gapi.client.calendar.Calendar): Calendar | null {
  if (!id || !summary) {
    return null;
  }

  return {
    id,
    title: summary,
  };
}

export function getNewSummary(
  currentSummary: string,
  prefix: string,
  action: "prepend" | "remove",
): string {
  if (action === "prepend" && !currentSummary.startsWith(prefix)) {
    return prefix + currentSummary;
  } else if (action === "remove" && currentSummary.startsWith(prefix)) {
    return currentSummary.slice(prefix.length);
  }
  return currentSummary;
}
