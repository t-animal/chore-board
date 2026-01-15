import type { Configuration } from "../../types/configuration";

const configKey = "config-v2";

export const DefaultConfiguration: Configuration = {
  selectedCalendar: null,
  backlogTimeSpan: 14,
  cleanUpTime: "when-due",
};

export function storeConfig(config: Configuration): void {
  localStorage.setItem(configKey, JSON.stringify(config));
}

export function loadConfig(): Configuration {
  const config = localStorage.getItem(configKey);
  return config !== null ? JSON.parse(config) : DefaultConfiguration;
}
