import type { Auth, calendar_v3, GoogleApis } from "googleapis";
import {
  type Calendar,
  type CalendarEvent,
  type Color,
  type GCalApi,
  getNewSummary,
  parseCalendar,
  parseEvent,
  Result,
} from "./gcal-api-common.js";

export class GCalApiNode implements GCalApi {
  private google: GoogleApis;
  private oauth2Client: Auth.OAuth2Client;

  private calendar: calendar_v3.Calendar;
  private colors: calendar_v3.Schema$Colors | null = null;

  constructor(google: GoogleApis, oauth2Client: Auth.OAuth2Client) {
    this.google = google;
    this.oauth2Client = oauth2Client;

    this.calendar = this.google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
  }

  async listCalendars(): Promise<Calendar[]> {
    const res = await this.calendar.calendarList.list();
    if (!res.data.items) return [];

    const calendars = Promise.all(res.data.items.map((item) => parseCalendar(item, this)));
    return (await calendars).filter((c) => c !== null);
  }

  async createCalendar(name: string): Promise<Result<Calendar>> {
    const res = await this.calendar.calendars.insert({
      requestBody: { summary: name },
    });

    const parsedResult = await parseCalendar(res.data, this);

    if (parsedResult === null) {
      return Result.error(`Failed to create calendar: ${res.statusText}`);
    }
    return Result.ok(parsedResult);
  }

  async listEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string,
    maxResults: number = 80,
  ): Promise<CalendarEvent[]> {
    const res = await this.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults,
    });
    if (!res.data.items) return [];

    const events = Promise.all(res.data.items.map((it) => parseEvent(it, this)));

    return (await events).filter((it) => it !== null);
  }

  async patchEvent(
    calendarId: string,
    eventId: string,
    prefix: string,
    action: "prepend" | "remove",
  ): Promise<Result<CalendarEvent>> {
    const originalResult = await this.calendar.events.get({ calendarId, eventId });
    const originalEvent = originalResult.data;

    const parsedOriginalEvent = await parseEvent(originalEvent, this);
    if (parsedOriginalEvent === null) {
      return Result.error("Failed to parse original event");
    }
    const newSummary = getNewSummary(parsedOriginalEvent.summary, prefix, action);

    if (newSummary === parsedOriginalEvent.summary) {
      return Result.ok(parsedOriginalEvent);
    }

    const patchRes = await this.calendar.events.patch({
      calendarId,
      eventId,
      requestBody: { summary: newSummary },
    });

    const patchedEvent = await parseEvent(patchRes.data, this);
    if (patchedEvent === null) {
      return Result.error(`Failed to parse patched event: ${patchRes.statusText}`);
    }
    return Result.ok(patchedEvent);
  }

  async resolveColor(colorId: string, type: "calendar" | "event"): Promise<Color | null> {
    if (!this.colors) {
      const res = await this.calendar.colors.get();
      this.colors = res.data;
    }

    const typeColor = (type === "calendar" ? this.colors?.calendar : this.colors?.event)?.[colorId];
    const { foreground, background } = typeColor ?? {};

    if (!foreground || !background) {
      return null;
    }

    return { foreground, background };
  }
}
