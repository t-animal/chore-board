import React, { useState } from 'react';
import './App.css';
import CalendarSelector from '../components/CalendarSelector';
import { signOut, signIn } from '../lib/authApiFacade';
import UpcomingEvents from '../components/UpcomingEvents';


function App(props: {apiLoaded: boolean; signedIn: boolean}): JSX.Element {

  const [calendarId, setCalendarId] = useState('primary');

  if (!props.apiLoaded) {
    return (
      <span>Waiting for google api to load...</span>
    );
  }

  return (
    <>
      <aside>
        {props.signedIn
          ? <button onClick={() => signOut()}>SignOut</button>
          : <button onClick={() => signIn()}>Auth</button> }

        <CalendarSelector newCalendarSelected={setCalendarId}></CalendarSelector>
      </aside>

      <div className="main-container">
        <header>
          <h1>Chores</h1>
        </header>
        <main>
          <UpcomingEvents calendarId={calendarId}></UpcomingEvents>
        </main>
      </div>
    </>
  );
}

export default App;
