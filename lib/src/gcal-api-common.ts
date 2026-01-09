import type { calendar_v3 } from "googleapis";
import { Temporal } from "temporal-polyfill";

export type Calendar = {
  id: string;
  title: string;
  color: Color | null;
};

export type CalendarEvent = {
  id: string;
  summary: string;
  description: string;
  start: Temporal.Instant;
  end: Temporal.Instant;
  color: Color | null;
};

export type Color = {
  foreground: string;
  background: string;
};

export type Result<T, E = unknown> = { success: true; data: T } | { success: false; error: E };

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

  resolveColor(colorId: string, type: "calendar" | "event"): Promise<Color | null>;
}

export async function parseEvent(
  {
    id,
    summary,
    description,
    start,
    end,
    colorId,
  }: calendar_v3.Schema$Event | gapi.client.calendar.Event,
  gcalApi: GCalApi,
): Promise<CalendarEvent | null> {
  if (!id || !summary || !start || !end) {
    return null;
  }

  function parseEventDate(dateTime: {
    dateTime?: string | null | undefined;
    date?: string | null | undefined;
  }): Temporal.Instant | null {
    if (dateTime.dateTime !== undefined && dateTime.dateTime !== null) {
      return Temporal.Instant.from(dateTime.dateTime);
    }
    if (dateTime.date !== undefined && dateTime.date !== null) {
      return Temporal.PlainDate.from(dateTime.date)
        .toZonedDateTime(Temporal.Now.timeZoneId())
        .toInstant();
    }
    return null;
  }
  const startInstant = parseEventDate(start);
  const endInstant = parseEventDate(end);
  if (startInstant === null || endInstant === null) {
    return null;
  }

  let color: Color | null = null;
  if (colorId) {
    color = await gcalApi.resolveColor(colorId, "event");
  }

  return {
    id,
    summary: summary,
    description: description ?? "",
    start: startInstant,
    end: endInstant,
    color,
  };
}

export async function parseCalendar(
  {
    id,
    summary,
    ...rawData
  }:
    | calendar_v3.Schema$CalendarListEntry
    | gapi.client.calendar.CalendarListEntry
    | gapi.client.calendar.Calendar,
  gcalApi: GCalApi,
): Promise<Calendar | null> {
  if (!id || !summary) {
    return null;
  }

  let color: Color | null = null;
  if (
    "foregroundColor" in rawData &&
    "backgroundColor" in rawData &&
    rawData.foregroundColor &&
    rawData.backgroundColor
  ) {
    color = { foreground: rawData.foregroundColor, background: rawData.backgroundColor };
  } else if ("colorId" in rawData && rawData.colorId) {
    color = await gcalApi.resolveColor(rawData.colorId, "calendar");
  }

  return {
    id,
    title: summary,
    color,
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
