import { CalendarEvent, modifyEvent, EventPatch } from './calendarApiFacade';
import moment, { Moment } from 'moment';

const DONE_MARK = '✔';

function getDoneDescription(description: string | undefined): string {
  if (description) {
    return `Done with: ${description}`;
  }
  return `Done.`;
}

export async function markEventAsDone(calendarId: string, event: CalendarEvent): Promise<void>{
  const eventPatch: EventPatch = {
    summary: `${DONE_MARK} ${event.summary}`,
    description: getDoneDescription(event.description),
    extendedProperties: {
      ...event.extendedProperties,
      private: {
        ...event.extendedProperties?.private,
        markedAsDoneBy: 'ChoreBoard'
      }
    }
  };

  if (isEventDone(event)){
    return;
  }

  await modifyEvent(calendarId, event, eventPatch);
}

export function isEventDone(event: CalendarEvent): boolean {
  const isDone = event.summary?.startsWith(DONE_MARK) || event.description?.startsWith('Done');

  return isDone ?? false;
}

export function isEventOverdue(event: CalendarEvent): boolean {
  const start = getStartMoment(event);
  const now = moment(new Date());

  if (start === null) {
    return false;
  }

  return start.isBefore(now);
}

export function getStartMoment(event: CalendarEvent): Moment | null {
  const startString = event.start?.dateTime ?? event.start?.date;
  if (startString === undefined) {
    return null;
  }

  return moment(startString);
}
