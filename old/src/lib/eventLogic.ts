import { CalendarEvent, modifyEvent, EventPatch } from './calendarApiFacade';
import moment, { Moment } from 'moment';

const DONE_MARK = '✔';
const DONE_DESCRIPTION_PREFILLED = 'Done with: ';
const DONE_DESCRIPTION_EMPTY = 'Done.';

export async function toggleEventDoneness(calendarId: string, event: CalendarEvent): Promise<void> {
  if (isEventDone(event)) {
    await markEventAsUndone(calendarId, event);
  } else {
    await markEventAsDone(calendarId, event);
  }
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

export function daysFromNow(event: CalendarEvent): number {
  const start = getStartMoment(event);
  if (start === null || isEventOverdue(event)) {
    return 0;
  }

  return start.diff(moment(), 'days');
}

async function markEventAsDone(calendarId: string, event: CalendarEvent): Promise<void>{
  const eventPatch: EventPatch = {
    summary: `${DONE_MARK} ${event.summary}`,
    description: getDoneDescription(event.description),
    ...getExtendedProperties(event)
  };

  if (isEventDone(event)){
    return;
  }

  await modifyEvent(calendarId, event, eventPatch);
}

async function markEventAsUndone(calendarId: string, event: CalendarEvent): Promise<void>{
  const eventPatch: EventPatch = {
    summary: `${event.summary?.substr(2)}`,
    description: removeDoneDescription(event.description),
    ...getExtendedProperties(event)
  };

  if (!isEventDone(event)){
    return;
  }

  await modifyEvent(calendarId, event, eventPatch);
}

function getDoneDescription(description: string | undefined): string {
  if (description) {
    return `${DONE_DESCRIPTION_PREFILLED} ${description}`;
  }
  return DONE_DESCRIPTION_EMPTY;
}


function removeDoneDescription(description: string | undefined): string | undefined {
  if (description === undefined) {
    return undefined;
  }

  if (description.startsWith(DONE_DESCRIPTION_PREFILLED)) {
    return description.substr(DONE_DESCRIPTION_PREFILLED.length);
  }

  return description.substr(DONE_DESCRIPTION_EMPTY.length);
}

function getExtendedProperties(event: CalendarEvent): Pick<CalendarEvent, 'extendedProperties'> {
  return {
    extendedProperties: {
      ...event.extendedProperties,
      private: {
        ...event.extendedProperties?.private,
        donenessMarkedBy: 'ChoreBoard'
      }
    }
  };
}
