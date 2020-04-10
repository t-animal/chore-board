export type Event = gapi.client.calendar.Event;
export type EventPatch = Partial<Event>;

type OrigPatchArg = Parameters<typeof gapi.client.calendar.events.patch>[0];
type FixedPatchArg = OrigPatchArg & { resource: EventPatch };

export async function getAllUpcomingEvents(calendarId: string) {
  const response = await gapi.client.calendar.events.list({
    calendarId,
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });

  return response.result.items;
};

export function modifyEvent(calendarId: string, event: Event, patch: EventPatch) {
  if(event.id === undefined) {
    return;
  }

  const eventPatch: FixedPatchArg = {
    eventId: event.id,
    calendarId,
    resource: {
      ...patch
    }
  };

  return new Promise((resolve, reject) =>
    gapi.client.calendar.events
      .patch(eventPatch)
      .then(resolve, reject)
  );
}
