export type CleanUpTime = 'immediately' | 'when-due';

export type Configuration = {
  selectedCalendar: string | null;
  backlogTimeSpan: number;
  cleanUpTime: CleanUpTime;
}
