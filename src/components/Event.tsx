import React, { useState } from 'react';
import { markEventAsDone, isEventOverdue, isEventDone } from '../lib/eventLogic';
import { getEventColor } from '../lib/colorApiFacade';
import moment from 'moment';

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

  function getDueDate(): string {
    const dueString = event.start?.dateTime ?? event.start?.date;
    if (dueString === null) {
      return 'Unknown';
    }

    return moment(dueString).fromNow();
  }

  return (
    <section
      className={
        `event
        ${(isEventOverdue(event) && !isEventDone(event)) ? 'overdue' : ''}
        ${isEventDone(event) ? 'done' : ''}`}
      onClick={ () => eventDone() }
      style={{ color: color ?? 'none' }}
    >
      <h2 className="event-title">{ event.summary }</h2>
      <span>{ event.description }</span>
      <span>Due: { getDueDate() }</span>
    </section>);
}
