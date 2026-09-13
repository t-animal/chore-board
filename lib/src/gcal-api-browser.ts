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

type GoogleApi = typeof globalThis.gapi;

export class GCalApiBrowser implements GCalApi {
  private gapi: GoogleApi;

  private colors: gapi.client.calendar.Colors | null = null;

  constructor(gapi: GoogleApi) {
    this.gapi = gapi;
  }

  static getGapi(): GoogleApi {
    const localGapi = globalThis.gapi as GoogleApi | undefined;
    if (!localGapi) throw new Error("gapi not found on globalThis; load Google API client first");
    return localGapi;
  }

  /**
   * Authorises requests with an OAuth access token, e.g. one obtained from
   * google.accounts.oauth2 in the browser.
   */
  async init(accessToken: string): Promise<void> {
    await new Promise<void>((resolve) =>
      this.gapi.load("client", async () => {
        await this.gapi.client.init({
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });
        resolve();
      }),
    );

    this.setAccessToken(accessToken);
  }

  setAccessToken(accessToken: string): void {
    this.gapi.client.setToken({ access_token: accessToken });
  }

  async listCalendars(): Promise<Calendar[]> {
    const res = await this.gapi.client.calendar.calendarList.list();
    if (!res.result?.items) return [];

    const calendars = Promise.all(res.result.items.map((item) => parseCalendar(item, this)));
    return (await calendars).filter((c) => c !== null);
  }

  async createCalendar(name: string): Promise<Result<Calendar>> {
    const res = await this.gapi.client.calendar.calendars.insert({
      summary: name,
    });

    if (!res.result) {
      return Result.error(`Failed to create calendar: ${res.statusText}`);
    }

    const parsedResult = await parseCalendar(res.result, this);
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

    const events = Promise.all(res.result?.items.map((it) => parseEvent(it, this)));

    return (await events).filter((it) => it !== null);
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

    const parsedOriginalEvent = await parseEvent(originalEvent, this);
    if (parsedOriginalEvent === null) {
      return Result.error("Failed to parse original event");
    }

    const newSummary = getNewSummary(parsedOriginalEvent.summary, prefix, action);
    if (newSummary === parsedOriginalEvent.summary) return Result.ok(parsedOriginalEvent);

    const patchRes = await this.gapi.client.calendar.events.update({
      calendarId,
      eventId,
      resource: {
        ...originalEvent,
        summary: newSummary,
        start: originalEvent.start,
        end: originalEvent.end,
        reminders: {
          ...originalEvent.reminders,
          overrides: originalEvent.reminders?.overrides ?? [],
        },
        gadget: undefined,
        originalStartTime: undefined,
      },
    });

    const patchedEvent = await parseEvent(patchRes.result, this);
    if (patchedEvent === null) {
      return Result.error(`Failed to parse patched event: ${patchRes.statusText}`);
    }
    return Result.ok(patchedEvent);
  }

  async resolveColor(colorId: string, type: "calendar" | "event"): Promise<Color | null> {
    if (!this.colors) {
      const res = await this.gapi.client.calendar.colors.get({});
      this.colors = res.result;
    }

    const typeColor = (type === "calendar" ? this.colors?.calendar : this.colors?.event)?.[colorId];
    const { foreground, background } = typeColor ?? {};

    if (!foreground || !background) {
      return null;
    }

    return { foreground, background };
  }
}
