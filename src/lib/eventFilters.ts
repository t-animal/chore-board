import { CalendarEvent } from './calendarApiFacade';
import moment from 'moment';
import { getStartMoment, isEventDone } from './eventLogic';
import { CleanUpTime } from '../typings/configuration';

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

export function getDoneItemsFilter(when: CleanUpTime) {
  return (event: CalendarEvent): boolean => {
    if (!isEventDone(event)) {
      return true;
    }

    const due = getStartMoment(event);
    const now = moment(new Date());
    const assertAllCases = (x: never): boolean => { throw new Error('Missing handler for ' + x); } ;

    switch (when){
      case 'immediately':
        return false;
      case 'when-due':
        if (due === null) {
          return true;
        }
        return !due.isBefore(now, 'days');
      default:
        return assertAllCases(when);
    }

  };
}
