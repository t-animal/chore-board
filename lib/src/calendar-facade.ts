import type { Calendar, CalendarEvent, GCalApi, Result } from "./gcal-api-common.js";

type Adapter = "browser" | "node";

type NodeOptions = {
  oauth2Client: import("googleapis").Auth.OAuth2Client;
};

type BrowserOptions = {
  clientId: string;
};

export function getGcalApi(options: BrowserOptions, adapter: "browser"): Promise<GCalApi>;
export function getGcalApi(options: NodeOptions, adapter: "node"): Promise<GCalApi>;
export async function getGcalApi(
  options: NodeOptions | BrowserOptions,
  adapter?: Adapter,
): Promise<GCalApi> {
  if (adapter === undefined) {
    if (typeof window === "undefined") {
      adapter = "node";
    } else {
      adapter = "browser";
    }
  }
  if (adapter === "node") {
    if (options === undefined || !("oauth2Client" in options)) {
      throw new Error("Node adapter requires node options");
    }
    return await initNodeApi(options);
  } else {
    if (options === undefined || !("clientId" in options)) {
      throw new Error("Browser adapter requires browser options");
    }
    return await initBrowserApi(options as BrowserOptions);
  }
}

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
): Promise<CalendarEvent[]> {
  const msPerDay = 24 * 60 * 60 * 1000;
  const nowMs = Date.now();

  const timeMin = new Date(nowMs - Math.max(0, daysPast) * msPerDay).toISOString();
  const timeMax = new Date(nowMs + Math.max(0, daysFuture) * msPerDay).toISOString();

  return api.listEvents(calendarId, timeMin, timeMax);
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

async function initBrowserApi(options: BrowserOptions): Promise<GCalApi> {
  const { GCalApiBrowser } = await import("./gcal-api-browser.js");
  const gapi = GCalApiBrowser.getGapi();

  const api = new GCalApiBrowser(gapi);
  await api.init(options.clientId);
  return api;
}

async function initNodeApi(options: NodeOptions): Promise<GCalApi> {
  try {
    await import("googleapis"); // just as a check
  } catch {
    throw new Error(
      "googleapis module not found; please install it to use the Node adapter (npm install googleapis)",
    );
  }
  const { GCalApiNode } = await import("./gcal-api-node.js");
  const { google } = await import("googleapis");
  return new GCalApiNode(google, options.oauth2Client);
}
