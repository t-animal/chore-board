import React, { useState } from 'react';
import { getAllUpcomingEvents } from '../lib/calendarApiFacade';
import { EventComponent } from './Event';
import { getOverdueItemsFilter, getDoneItemsFilter } from '../lib/eventFilters';
import { Configuration } from '../typings/configuration';
import { CalendarSelector } from './CalendarSelector';

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

  if (selectedCalendar !== null && loadedCalendar !== selectedCalendar) {
    listUpcomingEvents();
    setLoadedCalendar(selectedCalendar);
  }

  if (selectedCalendar === null ) {
    return (<div>
      <p>Please select a calendar. You can change your selection at any time in the sidebar.<br />
      It is recommended to create a dedicated calendar e.g. named &quot;Chores&quot;.</p>
      <CalendarSelector />
    </div>);
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
          calendarId={selectedCalendar}
          event={event}
          eventUpdated={listUpcomingEvents}></EventComponent>)
  } </>);
}
