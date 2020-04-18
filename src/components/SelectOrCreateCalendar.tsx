import React from 'react';
import { CalendarSelector } from './CalendarSelector';

export function SelectOrCreateCalendar(): JSX.Element {

  return (
    <div>
      <p>Please select a calendar. You can change your selection at any time in the sidebar.<br />
      It is recommended to create a dedicated calendar e.g. named &quot;Chores&quot;.</p>
      <CalendarSelector />

      <p>Alternatively, you can create a sample calendar. This needs additional write-permissions
      to your google calendar, though. <button>Create calendar</button></p>
    </div>
  );
}
