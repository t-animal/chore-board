import React, { useState } from 'react';
import { isUserSignedIn } from '../lib/authApiFacade';

import '../range.css';
import { getAllAvailableCalendars } from '../lib/calendarApiFacade';
import { ConfigurationConsumer, ConfigurationContext } from './ConfigurationContext';

type CalendarListEntry = gapi.client.calendar.CalendarListEntry;

export default function ConfigurationComponent(): JSX.Element {

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
    return <></>;
  }

  return (
    <ConfigurationConsumer>{(context: ConfigurationContext) => {
      const {selectedCalendar, backlogTimeSpan, cleanUpTime} = context.config;
      const {setBacklogTimeSpan, setCleanUpTime, setCalendar} = context.mutators;

      return (<>
        <section>
          <h3>Calendar</h3>
          Select the calendar to use: <br />
          <select
            onChange={(event) => setCalendar(event.target.value)}
            defaultValue={selectedCalendar}
          >
            {
              calendars.map(cal =>
                <option
                  key={cal.id}
                  value={cal.id}
                >{cal.summary}</option>
              )
            }
          </select>
        </section>

        <section>
          <h3>Backlog</h3>
          Select how long to keep unfinished items around:<br />
          <input
            type="range"
            min="0"
            max="31"
            onChange={(event) => setBacklogTimeSpan(event.target.valueAsNumber)}
            value={backlogTimeSpan} />
          {(backlogTimeSpan + '').padStart(2, '0')} days
        </section>

        <section>
          <h3>Clean-Up</h3>
          Hide completed items:<br />
          <label>
            <input
              type="radio"
              name="clean-up"
              value="1"
              onChange={() => setCleanUpTime('when-due')}
              checked={cleanUpTime === 'when-due'}
            />
            The day after they&apos;re due
          </label><br/>
          <label>
            <input
              type="radio"
              name="clean-up"
              value="0"
              onChange={() => setCleanUpTime('immediately')}
              checked={cleanUpTime === 'immediately'}
            />
            Immediately
          </label><br/>
        </section>
      </>);
    }}</ConfigurationConsumer>
  );
}
