import React, { useState } from 'react';
import { getAllUpcomingEvents } from '../lib/calendarApiFacade';
import { EventComponent } from './Event';
import { getOverdueItemsFilter, getDoneItemsFilter } from '../lib/eventFilters';
import { Configuration } from '../typings/configuration';

type Event = gapi.client.calendar.Event;
type UpcomingEventsProps = {
  config: Configuration;
};

export default function UpcomingEvents(props: UpcomingEventsProps): JSX.Element{

  const { selectedCalendar: calendarId, backlogTimeSpan } = props.config;

  const [loadedCalendar, setLoadedCalendar] = useState<null | string>(null);
  const [events, setEvents] = useState([] as Event[]);

  async function listUpcomingEvents(): Promise<void> {
    const upcomingEvents = await getAllUpcomingEvents(calendarId);

    if (upcomingEvents) {
      setEvents(upcomingEvents);
    }
  }

  if (loadedCalendar !== calendarId) {
    setLoadedCalendar(calendarId);
    listUpcomingEvents();
  }

  if (!events || events.length === 0) {
    return (<span>No upcoming events found</span>);
  }

  return (<> {
    events
      .filter(getOverdueItemsFilter(backlogTimeSpan))
      .filter(getDoneItemsFilter(props.config.cleanUpTime))
      .map(event =>
        <EventComponent
          key={event.id}
          calendarId={calendarId}
          event={event}
          eventUpdated={listUpcomingEvents}></EventComponent>)
  } </>);
}
