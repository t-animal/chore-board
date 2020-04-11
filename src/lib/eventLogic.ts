import { CalendarEvent, modifyEvent, EventPatch } from './calendarApiFacade';

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
