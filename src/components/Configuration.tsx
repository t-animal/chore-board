import React, { useState } from 'react';
import { isUserSignedIn } from '../lib/authApiFacade';
import { DefaultConfiguration, storeConfig, loadConfig } from '../lib/storage';
import { CleanUpTime, Configuration } from '../typings/configuration';

import '../range.css';
import { getAllAvailableCalendars } from '../lib/calendarApiFacade';

type CalendarListEntry = gapi.client.calendar.CalendarListEntry;
type CalendarSelectedProps = {
  configChanged: (config: Configuration) => void;
}

export default function ConfigurationComponent(props: CalendarSelectedProps): JSX.Element {

  const [ calendars, setCalendars ] = useState<CalendarListEntry[]|null>(null);
  const [ selectedCalendar, selectCalendar ] = useState<string>(DefaultConfiguration.selectedCalendar);
  const [ backlog, setBacklog ] = useState<number>(DefaultConfiguration.backlogTimeSpan);
  const [ cleanUp, setCleanUp ] = useState<CleanUpTime>(DefaultConfiguration.cleanUpTime);
  const [ configLoaded, setConfigLoaded ] = useState<boolean>(false);

  React.useEffect(configChanged, [selectedCalendar, backlog, cleanUp]);

  function initConfig(): void {
    if (configLoaded) {
      return;
    }

    const config = loadConfig();
    selectCalendar(config.selectedCalendar);
    setBacklog(config.backlogTimeSpan);
    setCleanUp(config.cleanUpTime);

    setConfigLoaded(true);
  }

  async function initCalendars(): Promise<void> {
    if (calendars !== null || !isUserSignedIn()) {
      return;
    }

    const response = await getAllAvailableCalendars();
    if (response.result.items) {
      setCalendars(response.result.items);
    }
  }

  function configChanged(): void {
    const config: Configuration = {
      selectedCalendar,
      backlogTimeSpan: backlog,
      cleanUpTime: cleanUp
    };

    storeConfig(config);
    props.configChanged(config);
  }

  function render(): JSX.Element {
    if (calendars === null) {
      return <></>;
    }

    return (
      <>
        <section>
          <h3>Calendar</h3>
          Select the calendar to use: <br />
          <select
            onChange={(event) => selectCalendar(event.target.value)}
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
            onChange={(event) => setBacklog(event.target.valueAsNumber)}
            value={backlog} />
          {(backlog + '').padStart(2, '0')} days
        </section>

        <section>
          <h3>Clean-Up</h3>
          Hide completed items:<br />
          <label>
            <input
              type="radio"
              name="clean-up"
              value="1"
              onChange={() => setCleanUp('when-due')}
              checked={cleanUp === 'when-due'}
            />
            The day after they&apos;re due
          </label><br/>
          <label>
            <input
              type="radio"
              name="clean-up"
              value="0"
              onChange={() => setCleanUp('immediately')}
              checked={cleanUp === 'immediately'}
            />
            Immediately
          </label><br/>
        </section>


      </>
    );
  }

  initCalendars();
  initConfig();
  return render();

}
