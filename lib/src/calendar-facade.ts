import type { Calendar, CalendarEvent, GCalApi, Result } from "./gcal-api-common.js";

export async function listCalendars(api: GCalApi): Promise<Calendar[]> {
  return api.listCalendars();
}

export async function createCalendar(api: GCalApi, name: string): Promise<Result<Calendar>> {
  return api.createCalendar(name);
}

export async function listEvents(
  api: GCalApi,
  calendarId: string,
  daysPast: number,
  daysFuture: number,
  maxResults: number,
): Promise<CalendarEvent[]> {
  const msPerDay = 24 * 60 * 60 * 1000;
  const nowMs = Date.now();

  const timeMin = new Date(nowMs - Math.max(0, daysPast) * msPerDay).toISOString();
  const timeMax = new Date(nowMs + Math.max(0, daysFuture) * msPerDay).toISOString();

  return api.listEvents(calendarId, timeMin, timeMax, maxResults);
}

export async function modifyEventTitle(
  api: GCalApi,
  calendarId: string,
  eventId: string,
  prefix: string,
  action: "prepend" | "remove",
): Promise<Result<CalendarEvent>> {
  return api.patchEvent(calendarId, eventId, prefix, action);
}
