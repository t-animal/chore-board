import React, { useState } from 'react';
import { ConfigurationConsumer } from './ConfigurationContext';
import { getAllAvailableCalendars } from '../lib/calendarApiFacade';
import { isUserSignedIn } from '../lib/authApiFacade';

type CalendarListEntry = gapi.client.calendar.CalendarListEntry;

export function CalendarSelector(): JSX.Element {
  const [ calendars, setCalendars ] = useState<CalendarListEntry[]|null>(null);

  async function initCalendars(): Promise<void> {
    if (calendars !== null || !isUserSignedIn()) {
      return;
    }

    const response = await getAllAvailableCalendars();
    if (response.result.items) {
      setCalendars(response.result.items);
    }
  }

  initCalendars();

  if (calendars === null) {
    return <>Loading calendars...</>;
  }

  return (
    <ConfigurationConsumer>{({config, mutators}) => {
      return <>
        Select the calendar to use: <br />
        <select
          onChange={(event) => mutators.setCalendar(event.target.value)}
          value={config.selectedCalendar ?? undefined}
        >
          <option>Please select a calendar</option>
          {
            calendars.map(cal =>
              <option
                key={cal.id}
                value={cal.id}
              >{cal.summary}</option>
            )
          }
        </select>
      </>;
    }
    }</ConfigurationConsumer>);
}
