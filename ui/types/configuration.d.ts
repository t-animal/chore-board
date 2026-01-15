export type CleanUpTime = 'immediately' | 'when-due';

export type SelectedCalendar = {
  id: string;
  title?: string;
};

export type Configuration = {
  selectedCalendar: SelectedCalendar | null;
  backlogTimeSpan: number;
  cleanUpTime: CleanUpTime;
}
