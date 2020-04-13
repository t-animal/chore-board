import { CalendarEvent } from './calendarApiFacade';
import moment from 'moment';
import { getStartMoment } from './eventLogic';

export function getOverdueItemsFilter(backlogTimeSpan: number) {
  return (event: CalendarEvent): boolean => {
    const start = getStartMoment(event);
    const now = moment(new Date());
    if (start === null) {
      return false;
    }

    return start.diff(now, 'days') > -backlogTimeSpan;
  };
}
