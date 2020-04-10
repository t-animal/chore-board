import { Event, modifyEvent, EventPatch } from './calendarApiFacade';

function getDoneDescription(description: string | undefined) {
  if(description) {
    return `Done with: ${description}`;
  }
  return `Done.`
}

export function markEventAsDone(calendarId: string, event: Event) {
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

  return modifyEvent(calendarId, event, eventPatch);
}
