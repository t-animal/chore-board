import React, { useState } from 'react';
import { getAllUpcomingEvents } from '../lib/calendarApiFacade';
import { EventComponent } from './Event';
import { getOverdueItemsFilter, getDoneItemsFilter } from '../lib/eventFilters';
import { Configuration } from '../typings/configuration';
import { daysFromNow } from '../lib/eventLogic';

type Event = gapi.client.calendar.Event;
type UpcomingEventsProps = {
  config: Configuration;
  loadingCalendarsFailed:  (e: {status?: number}) => void;
};

export default function UpcomingEvents(props: UpcomingEventsProps): JSX.Element{

  const { selectedCalendar, backlogTimeSpan } = props.config;

  const [loadedCalendar, setLoadedCalendar] = useState<null | string>(null);
  const [events, setEvents] = useState([] as Event[]);

  async function listUpcomingEvents(): Promise<void> {
    if (selectedCalendar === null){
      return;
    }

    try {
      const upcomingEvents = await getAllUpcomingEvents(selectedCalendar);

      if (upcomingEvents) {
        setEvents(upcomingEvents);
      }

    } catch (e) {
      props.loadingCalendarsFailed(e);
    }
  }

  if (selectedCalendar === null) {
    return (<></>);
  }

  if (loadedCalendar !== selectedCalendar) {
    listUpcomingEvents();
    setLoadedCalendar(selectedCalendar);
  }

  if (!events || events.length === 0) {
    return (<span>No upcoming events found</span>);
  }

  const imminentEvents = events.filter(event => daysFromNow(event) <= 7);
  const soonEvents     = events.filter(event => daysFromNow(event) > 7 && daysFromNow(event) <= 45);
  const distantEvents  = events.filter(event => daysFromNow(event) > 45);

  const renderEvents = (eventsToRender: Event[]): JSX.Element[] =>
    eventsToRender
      .filter(getOverdueItemsFilter(backlogTimeSpan))
      .filter(getDoneItemsFilter(props.config.cleanUpTime))
      .map(event =>
        <EventComponent
          key={event.id}
          calendarId={selectedCalendar}
          event={event}
          eventUpdated={listUpcomingEvents}></EventComponent>);

  return (<main>
    { renderEvents(imminentEvents) }
    <div className="divider">Soon: </div>
    { renderEvents(soonEvents) }
    <div className="divider">Distant: </div>
    { renderEvents(distantEvents) }
  </main>);

}
