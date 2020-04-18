import React, { useState } from 'react';
import { isEventOverdue, isEventDone, toggleEventDoneness, getStartMoment, daysFromNow } from '../lib/eventLogic';
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
    const start = getStartMoment(event);
    if (start === null) {
      return 'Unknown';
    }

    return start.fromNow();
  }

  const overdueClass = (isEventOverdue(event) && !isEventDone(event)) ? 'overdue' : '';
  const doneClass = isEventDone(event) ? 'done' : '';

  return (
    <section
      className={`event ${overdueClass} ${doneClass}`}
      onClick={ () => eventClicked() }
      style={{ color: color ?? 'none', opacity: Math.max(0.05, 1 - daysFromNow(event)/180) }}
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
