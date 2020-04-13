import { CalendarEvent } from './calendarApiFacade';
import moment from 'moment';

export function getOverdueItemsFilter(backlogTimeSpan: number) {
  return (event: CalendarEvent): boolean => {
    const startString = event.start?.dateTime ?? event.start?.date;
    if (startString === null) {
      return false;
    }

    const start = moment(startString);
    const now = moment(new Date());

    console.log(start.isBefore(now), start.diff(now, 'days'));

    return start.diff(now, 'days') > -backlogTimeSpan;
  };
}
