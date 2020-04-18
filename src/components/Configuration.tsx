import React from 'react';

import '../range.css';
import { ConfigurationConsumer, ConfigurationContext } from './ConfigurationContext';
import { CalendarSelector } from './CalendarSelector';


export default function ConfigurationComponent(): JSX.Element {
  return (
    <ConfigurationConsumer>{(context: ConfigurationContext) => {
      const {backlogTimeSpan, cleanUpTime} = context.config;
      const {setBacklogTimeSpan, setCleanUpTime} = context.mutators;

      return (<>
        <section>
          <h3>Calendar</h3>
          <CalendarSelector />
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
