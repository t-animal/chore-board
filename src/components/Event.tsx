
import React from 'react';
import { markEventAsDone } from '../lib/eventLogic';


type Event = gapi.client.calendar.Event;
type EventComponentProps = {
  calendarId: string;
  event: Event;
  eventUpdated: () => void | Promise<void>;
};

export function EventComponent(props: EventComponentProps): JSX.Element {
  const {event} = props;

  async function eventDone(): Promise<void> {
    await markEventAsDone(props.calendarId, event);
    props.eventUpdated();
  }

  return (
    <section
      className="event"
      onClick={ () => eventDone() }
      style={{ color: 'red' }}
    >
      <h2 className="event-title">{ event.summary }</h2>
      <span>{ event.description }</span>
    </section>);
}
