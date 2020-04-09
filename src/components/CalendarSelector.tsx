import React, { useState, ChangeEvent } from 'react';
import { isUserSignedIn } from '../lib/authApiFacade';

type CalendarListEntry = gapi.client.calendar.CalendarListEntry;
type CalendarSelectedProps = {
  newCalendarSelected: (calendarId: string) => void
}

export default function CalendarSelector(props: CalendarSelectedProps) {

  const [ calendars, setCalendars ] = useState<CalendarListEntry[]|null>(null);

  function initCalendars() {
    if(calendars === null && isUserSignedIn()) {
      const updateCalendarsFromApi = () => {
        gapi.client.calendar.calendarList
          .list({})
          .then(({result}) => {
            if(result.items) { setCalendars(result.items) }
          });
      };
  
      gapi.client.calendar.calendarList
        .watch({})
        .execute(updateCalendarsFromApi)
    }
  }

  function newCalendarSelected(event: ChangeEvent<HTMLSelectElement>) {
    props.newCalendarSelected(event.target.value);
  }

  function render() {
    if(calendars === null) {
      return <></>;
    }

    return (
      <div>
        Select calendar:
        <select onChange={newCalendarSelected}>
          { calendars.map(cal => <option key={cal.id} value={cal.id}>{cal.summary}</option>) }
        </select>
      </div>
    );
  }

  initCalendars();
  return render();

}
