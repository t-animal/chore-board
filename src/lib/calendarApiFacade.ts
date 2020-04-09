
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
