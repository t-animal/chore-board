import type { GCalApi } from "./gcal-api-common.js";

type BrowserOptions = {
  clientId: string;
};

export function getGcalApi(options: BrowserOptions, adapter: "browser"): Promise<GCalApi>;
export function getGcalApi(options: BrowserOptions, adapter?: "browser"): Promise<GCalApi>;
export async function getGcalApi(
  options: BrowserOptions,
  adapter: "browser" = "browser",
): Promise<GCalApi> {
  if (adapter !== "browser") {
    throw new Error("This build only supports the browser adapter");
  }

  const { GCalApiBrowser } = await import("./gcal-api-browser.js");
  const gapi = GCalApiBrowser.getGapi();

  const api = new GCalApiBrowser(gapi);
  await api.init(options.clientId);
  return api;
}
