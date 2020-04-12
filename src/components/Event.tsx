import React, { useState } from 'react';
import { markEventAsDone } from '../lib/eventLogic';
import { getEventColor } from '../lib/colorApiFacade';

type Event = gapi.client.calendar.Event;
type EventComponentProps = {
  calendarId: string;
  event: Event;
  eventUpdated: () => void | Promise<void>;
};

export function EventComponent(props: EventComponentProps): JSX.Element {
  const { event } = props;

  const [ color, setColor ] = useState<string | null>(null);

  if (color === null && event.colorId) {
    getEventColor(event.colorId)
      .then(resolvedColor => resolvedColor?.background ?? 'none')
      .then(setColor);
  }

  async function eventDone(): Promise<void> {
    await markEventAsDone(props.calendarId, event);
    props.eventUpdated();
  }

  return (
    <section
      className="event"
      onClick={ () => eventDone() }
      style={{ color: color ?? 'none' }}
    >
      <h2 className="event-title">{ event.summary }</h2>
      <span>{ event.description }</span>
    </section>);
}
