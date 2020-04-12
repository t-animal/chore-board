import React, { useState } from 'react';
import { isUserSignedIn } from '../lib/authApiFacade';

type CalendarListEntry = gapi.client.calendar.CalendarListEntry;
type CalendarSelectedProps = {
  configChanged: (config: Configuration) => void;
}

type Configuration = {
  selectedCalendar: string;
  backlogTimeSpan: number;
  cleanUpTimeSpan: number;
}

export const DefaultConfiguration: Configuration = {
  selectedCalendar: 'primary',
  backlogTimeSpan: 14,
  cleanUpTimeSpan: 1
};

export default function Configuration(props: CalendarSelectedProps): JSX.Element {

  const [ calendars, setCalendars ] = useState<CalendarListEntry[]|null>(null);
  const [ selectedCalendar, selectCalendar ] = useState<string>(DefaultConfiguration.selectedCalendar);
  const [ backlog, setBacklog ] = useState<number>(DefaultConfiguration.backlogTimeSpan);
  const [ cleanUp, setCleanUp ] = useState<number>(DefaultConfiguration.cleanUpTimeSpan);

  React.useEffect(configChanged, [selectedCalendar, backlog, cleanUp]);

  function initCalendars(): void {
    if (calendars === null && isUserSignedIn()) {
      const updateCalendarsFromApi = (): void => {
        gapi.client.calendar.calendarList
          .list({})
          .then(({result}) => {
            if (result.items) { setCalendars(result.items); }
          });
      };
  
      gapi.client.calendar.calendarList
        .watch({})
        .execute(updateCalendarsFromApi);
    }
  }

  function configChanged(): void {
    props.configChanged({
      selectedCalendar,
      backlogTimeSpan: backlog,
      cleanUpTimeSpan: cleanUp
    });
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
          <select onChange={(event) => selectCalendar(event.target.value)}>
            {
              calendars.map(cal =>
                <option
                  key={cal.id}
                  value={cal.id}
                  selected={cal.id === selectedCalendar}
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
          Remove completed items:<br />
          <label>
            <input
              type="radio"
              name="clean-up"
              value="1"
              onChange={() => setCleanUp(1)}
              checked={cleanUp === 1}
            />
            On the next day
          </label><br/>
          <label>
            <input
              type="radio"
              name="clean-up"
              value="0"
              onChange={() => setCleanUp(0)}
              checked={cleanUp === 0}
            />
            Immediately
          </label><br/>
        </section>


      </>
    );
  }

  initCalendars();
  return render();

}
