export type CalendarEvent = gapi.client.calendar.Event;
export type EventPatch = Partial<CalendarEvent>;

type OrigPatchArg = Parameters<typeof gapi.client.calendar.events.patch>[0];
type FixedPatchArg = OrigPatchArg & { resource: EventPatch };

export async function getAllUpcomingEvents(calendarId: string): Promise<CalendarEvent[] | undefined> {
  const response = await gapi.client.calendar.events.list({
    calendarId,
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });

  return response.result.items;
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
