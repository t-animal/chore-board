import moment from 'moment';

export type CalendarList = gapi.client.calendar.CalendarList;
export type CalendarEvent = gapi.client.calendar.Event;
export type EventPatch = Partial<CalendarEvent>;

type OrigPatchArg = Parameters<typeof gapi.client.calendar.events.patch>[0];
type FixedPatchArg = OrigPatchArg & { resource: EventPatch };

export function getAllAvailableCalendars(): Promise<gapi.client.Response<CalendarList>> {
  return new Promise((resolve, reject) => {
    gapi.client.calendar.calendarList
      .list({})
      .then(resolve, reject);
  });
}


export async function getAllUpcomingEvents(calendarId: string): Promise<CalendarEvent[] | undefined> {
  const passed = gapi.client.calendar.events.list({
    calendarId,
    'timeMin': (moment().subtract(31, 'days')).toISOString(),
    'timeMax': moment().toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  });
  const future = gapi.client.calendar.events.list({
    calendarId,
    'timeMin': moment().toISOString(),
    'timeMax': (moment().add(7, 'months')).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 80,
    'orderBy': 'startTime'
  });

  const allResponses = await Promise.all([passed, future]);
  const allEvents2d = allResponses.map(response => response.result.items);

  if (allEvents2d.some(element => element === undefined)) {
    return undefined;
  }

  return allEvents2d.flat();
}

export function modifyEvent(calendarId: string, event: CalendarEvent, patch: EventPatch): Promise<gapi.client.Response<CalendarEvent>> {
  return new Promise((resolve, reject) => {
    if (event.id === undefined) {
      reject('Invalid input event');
      return;
    }

    const eventPatch: FixedPatchArg = {
      eventId: event.id,
      calendarId,
      resource: {
        ...patch
      }
    };

    gapi.client.calendar.events
      .patch(eventPatch)
      .then(resolve, reject);
  });
}
