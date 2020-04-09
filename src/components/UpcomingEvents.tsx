import React, { useState } from "react";
import { getAllUpcomingEvents } from "../lib/calendarApiFacade";

type UpcomingEventsProps = {
  calendarId: string
};

export default function UpcomingEvents(props: UpcomingEventsProps = {calendarId: 'primary'}) {

  const [loadedCalendar, setLoadedCalendar] = useState<null | string>(null);
  const [messages, setMessages] = useState([] as string[]);

  function addMessages(newMessages: string[]) {
    setMessages([...messages, ...newMessages]);
  }

  async function listUpcomingEvents() {
    const events = await getAllUpcomingEvents(props.calendarId);

    const messagesToAdd = ['Upcoming events:'];

    if (!events || events.length  === 0) {
      return [...messagesToAdd, 'No upcoming events found'];
    }

    for (const event of events) {
      let when = event.start?.dateTime;
      if (!when) {
        when = event.start?.date ?? 'unknown date';
      }
      messagesToAdd.push(event.summary + ' (' + when + ')')
    }

    addMessages(messagesToAdd);
  }

  if(loadedCalendar !== props.calendarId) {
    setLoadedCalendar(props.calendarId);
    listUpcomingEvents();
  }

  return (
    <pre>
      { messages.join('\n') }
    </pre>
  )
}
