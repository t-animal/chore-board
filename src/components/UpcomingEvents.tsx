import React, { useState } from "react";
import { getAllUpcomingEvents } from "../logic/calendarApiFacade";

export default function UpcomingEvents() {

  const [messages, setMessages] = useState([] as string[]);

  function addMessages(newMessages: string[]) {
    setMessages([...messages, ...newMessages]);
  }

  async function listUpcomingEvents() {
    const events = await getAllUpcomingEvents();

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

  if(messages.length === 0)
    listUpcomingEvents();

  return (
    <pre>
      { messages.join('\n') }
    </pre>
  )
}
