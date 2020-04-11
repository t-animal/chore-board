import React, { useState } from 'react';
import { getAllUpcomingEvents } from '../lib/calendarApiFacade';
import { markEventAsDone } from '../lib/eventLogic';

type Event = gapi.client.calendar.Event;
type UpcomingEventsProps = {
  calendarId: string;
};

export default function UpcomingEvents(props: UpcomingEventsProps = {calendarId: 'primary'}): JSX.Element {

  const [loadedCalendar, setLoadedCalendar] = useState<null | string>(null);
  const [events, setEvents] = useState([] as Event[]);

  async function listUpcomingEvents(): Promise<void> {
    const upcomingEvents = await getAllUpcomingEvents(props.calendarId);

    if (upcomingEvents) {
      setEvents(upcomingEvents);
    }
  }

  async function eventDone(event: Event): Promise<void> {
    await markEventAsDone(props.calendarId, event);
    listUpcomingEvents();
  }

  function renderEvents(): JSX.Element | JSX.Element[] {
    if (!events || events.length === 0) {
      return (<span>No upcoming events found</span>);
    }

    return events.map(event => {
      let when = event.start?.dateTime;
      if (!when) {
        when = event.start?.date ?? 'unknown date';
      }
      return (
        <div key={event.id}>
          {event.summary} ({ when })
          <button onClick={ () => eventDone(event) }>
            modify
          </button>
        </div>);
    });
  }

  if (loadedCalendar !== props.calendarId) {
    setLoadedCalendar(props.calendarId);
    listUpcomingEvents();
  }

  return (
    <pre>
      { renderEvents() }
    </pre>
  );
}
