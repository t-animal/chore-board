import React, { useState } from 'react';
import { CalendarSelector } from './CalendarSelector';
import { createNewCalendar, insertSampleEvents } from '../lib/sampleCalendarCreator';
import { ConfigurationConsumer } from './ConfigurationContext';

export function SelectOrCreateCalendar(): JSX.Element {

  const [showSpinner, setShowSpinner] = useState(false);
  const [creatingCalendar, setCreatingCalendar] = useState(false);
  const [creatingEvents, setCreatingEvents] = useState(false);

  async function createAndFillCalendar(setCalendar: (calendarId: string) => void): Promise<void> {
    try {
      setShowSpinner(true);
      setCreatingCalendar(true);
      const calendarId = await createNewCalendar();
      setCreatingCalendar(false);
      setCreatingEvents(true);
      await insertSampleEvents(calendarId);
      setCreatingEvents(false);
      setCalendar(calendarId);
      setShowSpinner(false);
    } catch (e) {
      alert('Failed. Please try again.');
      setShowSpinner(false);
      setCreatingCalendar(false);
      setCreatingEvents(false);
    }
  }

  return (<ConfigurationConsumer>{context => (
    <div>
      <style>
        .loader {'{'} font-size: 4px; margin: 0px; left: 15px; display: inline-block; {'}'}
      </style>
      <p>Please select a calendar. You can change your selection at any time in the sidebar.<br />
      It is recommended to create a dedicated calendar e.g. named &quot;Chores&quot;.<br />
      If you haven&apos;t done that yet you can do it <a href="https://calendar.google.com/calendar/r/settings/createcalendar">using this link</a>.
      Please reload this page after you&apos;re done.</p>
      <CalendarSelector />

      <p>Alternatively, you can create a sample calendar.<br />This needs additional write-permissions
      to your google calendar, though.</p>
      <button onClick={() => createAndFillCalendar(context.mutators.setCalendar)}>Create calendar</button>
      { showSpinner ? <div className="loader">Creating calendar...</div> : <></>}
      { creatingCalendar ? <div>Creating google calendar... this can take some time.</div> : <></> }
      { creatingEvents ? <div>Inserting sample events into calendar...</div> : <></> }
    </div>
  )}</ConfigurationConsumer>);
}
