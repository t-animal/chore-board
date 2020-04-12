import React, { useState } from 'react';
import { getAllUpcomingEvents } from '../lib/calendarApiFacade';
import { EventComponent } from './Event';

type Event = gapi.client.calendar.Event;
type UpcomingEventsProps = {
  calendarId: string;
};

export default function UpcomingEvents(props: UpcomingEventsProps = {calendarId: 'primary'}): JSX.Element {

  const { calendarId } = props;

  const [loadedCalendar, setLoadedCalendar] = useState<null | string>(null);
  const [events, setEvents] = useState([] as Event[]);

  async function listUpcomingEvents(): Promise<void> {
    const upcomingEvents = await getAllUpcomingEvents(props.calendarId);

    if (upcomingEvents) {
      setEvents(upcomingEvents);
    }
  }

  function renderEvents(): JSX.Element | JSX.Element[] {
    if (!events || events.length === 0) {
      return (<span>No upcoming events found</span>);
    }

    return events.map(event =>
      <EventComponent
        key={event.id}
        calendarId={calendarId}
        event={event}
        eventUpdated={listUpcomingEvents}></EventComponent>);
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
