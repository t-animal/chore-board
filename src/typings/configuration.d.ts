export type CleanUpTime = 'immediately' | 'when-due';

export type Configuration = {
  selectedCalendar: string;
  backlogTimeSpan: number;
  cleanUpTime: CleanUpTime;
}
