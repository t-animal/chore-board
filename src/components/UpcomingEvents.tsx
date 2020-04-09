import React, { useState } from "react";
import { getAllUpcomingEvents } from "../lib/calendarApiFacade";

type Event = gapi.client.calendar.Event;
type UpcomingEventsProps = {
  calendarId: string
};

export default function UpcomingEvents(props: UpcomingEventsProps = {calendarId: 'primary'}) {

  const [loadedCalendar, setLoadedCalendar] = useState<null | string>(null);
  const [events, setEvents] = useState([] as Event[]);

  async function listUpcomingEvents() {
    const events = await getAllUpcomingEvents(props.calendarId);

    if(events){
      setEvents(events);
    }
  }

  function renderEvents() {
    if (!events || events.length === 0) {
      return (<span>No upcoming events found</span>);
    }

    return events.map(event => {
      let when = event.start?.dateTime;
      if (!when) {
        when = event.start?.date ?? 'unknown date';
      }
      return (<div key={event.id}>{event.summary} ({ when })</div>);
    });
  }

  if(loadedCalendar !== props.calendarId) {
    setLoadedCalendar(props.calendarId);
    listUpcomingEvents();
  }

  return (
    <pre>
      { renderEvents() }
    </pre>
  )
}
