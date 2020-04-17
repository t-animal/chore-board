import React, { useState } from 'react';
import { isEventOverdue, isEventDone, toggleEventDoneness } from '../lib/eventLogic';
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
  const [ showSpinner, setShowSpinner ] = useState<boolean>(false);

  if (color === null && event.colorId) {
    getEventColor(event.colorId)
      .then(resolvedColor => resolvedColor?.background ?? 'none')
      .then(setColor);
  }

  async function eventClicked(): Promise<void> {
    setShowSpinner(true);
    await toggleEventDoneness(props.calendarId, event);
    props.eventUpdated();
    setShowSpinner(false);
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
      onClick={ () => eventClicked() }
      style={{ color: color ?? 'none' }}
    >
      <h2 className="event-title">{ event.summary }</h2>
      <span>{ event.description }</span>
      { !isEventDone(event) ? <span>Due: { getDueDate() }</span> : '' }
      { showSpinner ?
        <div className="loader-container">
          <div className="loader">Loading...</div>
        </div>
        : '' }
    </section>);
}
