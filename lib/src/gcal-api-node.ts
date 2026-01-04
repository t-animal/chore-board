import type { Auth, GoogleApis } from "googleapis";
import {
  type Calendar,
  type CalendarEvent,
  type GCalApi,
  getNewSummary,
  parseCalendar,
  parseEvent,
  Result,
} from "./gcal-api-common.js";

export class GCalApiNode implements GCalApi {
  private google: GoogleApis;
  private oauth2Client: Auth.OAuth2Client;

  constructor(google: GoogleApis, oauth2Client: Auth.OAuth2Client) {
    this.google = google;
    this.oauth2Client = oauth2Client;
  }

  getAuthUrl(scopes: string[] = ["https://www.googleapis.com/auth/calendar"]) {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
  }

  async getTokenFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  setCredentials(tokens: Auth.Credentials) {
    this.oauth2Client.setCredentials(tokens);
  }

  async listCalendars(): Promise<Calendar[]> {
    const calendar = this.google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const res = await calendar.calendarList.list();
    if (!res.data.items) return [];

    return res.data.items.map(parseCalendar).filter((c) => c !== null);
  }

  async createCalendar(name: string): Promise<Result<Calendar>> {
    const calendar = this.google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const res = await calendar.calendars.insert({
      requestBody: { summary: name },
    });

    const parsedResult = parseCalendar(res.data);

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
    const calendar = this.google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const res = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults,
    });
    if (!res.data.items) return [];

    return res.data.items.map(parseEvent).filter((e) => e !== null);
  }

  async patchEvent(
    calendarId: string,
    eventId: string,
    prefix: string,
    action: "prepend" | "remove",
  ): Promise<Result<CalendarEvent>> {
    const calendar = this.google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const originalResult = await calendar.events.get({ calendarId, eventId });
    const originalEvent = originalResult.data;

    const parsedOriginalEvent = parseEvent(originalEvent);
    if (parsedOriginalEvent === null) {
      return Result.error("Failed to parse original event");
    }

    const newSummary = getNewSummary(
      parsedOriginalEvent.summary,
      prefix,
      action,
    );

    if (newSummary === parsedOriginalEvent.summary) {
      return Result.ok(parsedOriginalEvent);
    }

    const patchRes = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: { summary: newSummary },
    });

    const patchedEvent = parseEvent(patchRes.data);
    if (patchedEvent === null) {
      return Result.error(
        `Failed to parse patched event: ${patchRes.statusText}`,
      );
    }
    return Result.ok(patchedEvent);
  }
}
