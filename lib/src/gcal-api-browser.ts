import {
  type Calendar,
  type CalendarEvent,
  type GCalApi,
  getNewSummary,
  parseCalendar,
  parseEvent,
  Result,
} from "./gcal-api-common.js";

type GoogleApi = typeof globalThis.gapi;

export class GCalApiBrowser implements GCalApi {
  private gapi: GoogleApi;

  constructor(gapi: GoogleApi) {
    this.gapi = gapi;
  }

  static getGapi(): GoogleApi {
    const localGapi = globalThis.gapi as GoogleApi | undefined;
    if (!localGapi) throw new Error("gapi not found on globalThis; load Google API client first");
    return localGapi;
  }

  async init(
    clientId: string,
    scopes: string[] = ["https://www.googleapis.com/auth/calendar"],
  ): Promise<void> {
    return new Promise((resolve) =>
      this.gapi.load("client", async () => {
        await this.gapi.client.init({
          clientId,
          scope: scopes.join(" "),
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });
        resolve();
      }),
    );
  }

  async listCalendars(): Promise<Calendar[]> {
    const res = await this.gapi.client.calendar.calendarList.list();
    if (!res.result?.items) return [];

    return res.result.items.map(parseCalendar).filter((c) => c !== null);
  }

  async createCalendar(name: string): Promise<Result<Calendar>> {
    const res = await this.gapi.client.calendar.calendars.insert({
      summary: name,
    });

    if (!res.result) {
      return Result.error(`Failed to create calendar: ${res.statusText}`);
    }

    const parsedResult = parseCalendar(res.result);
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
    const res = await this.gapi.client.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults,
    });

    if (!res.result?.items) return [];

    return res.result?.items.map(parseEvent).filter((e) => e !== null);
  }

  async patchEvent(
    calendarId: string,
    eventId: string,
    prefix: string,
    action: "prepend" | "remove",
  ): Promise<Result<CalendarEvent>> {
    const originalResult = await this.gapi.client.calendar.events.get({
      calendarId,
      eventId,
    });
    const originalEvent = originalResult.result;

    const parsedOriginalEvent = parseEvent(originalEvent);
    if (parsedOriginalEvent === null) {
      return Result.error("Failed to parse original event");
    }

    const newSummary = getNewSummary(parsedOriginalEvent.summary, prefix, action);
    if (newSummary === parsedOriginalEvent.summary) return Result.ok(parsedOriginalEvent);

    const patchRes = await this.gapi.client.calendar.events.update({
      calendarId,
      eventId,
      resource: {
        summary: newSummary,
        start: originalEvent.start,
        end: originalEvent.end,
      },
    });

    const patchedEvent = parseEvent(patchRes.result);
    if (patchedEvent === null) {
      return Result.error(`Failed to parse patched event: ${patchRes.statusText}`);
    }
    return Result.ok(patchedEvent);
  }
}
