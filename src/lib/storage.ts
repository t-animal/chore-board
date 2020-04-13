export type Configuration = {
  selectedCalendar: string;
  backlogTimeSpan: number;
  cleanUpTimeSpan: number;
}

export const DefaultConfiguration: Configuration = {
  selectedCalendar: 'primary',
  backlogTimeSpan: 14,
  cleanUpTimeSpan: 1
};

export function storeConfig(config: Configuration): void {
  localStorage.setItem('config', JSON.stringify(config));
}

export function loadConfig(): Configuration {
  const config = localStorage.getItem('config');

  return config !== null ? JSON.parse(config) : DefaultConfiguration;
}
