import { CalendarEvent, modifyEvent, EventPatch } from './calendarApiFacade';
import moment, { Moment } from 'moment';

function getDoneDescription(description: string | undefined): string {
  if (description) {
    return `Done with: ${description}`;
  }
  return `Done.`;
}

export async function markEventAsDone(calendarId: string, event: CalendarEvent): Promise<void>{
  const eventPatch: EventPatch = {
    summary: `✔ ${event.summary}`,
    description: getDoneDescription(event.description),
    extendedProperties: {
      ...event.extendedProperties,
      private: {
        ...event.extendedProperties?.private,
        markedAsDoneBy: 'ChoreBoard'
      }
    }
  };

  await modifyEvent(calendarId, event, eventPatch);
  return;
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
