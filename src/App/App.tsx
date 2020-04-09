import React, { useState } from 'react';
import './App.css';
import CalendarSelector from '../components/CalendarSelector';
import { signOut, signIn } from '../lib/authApiFacade';
import UpcomingEvents from '../components/UpcomingEvents';


function App(props: {apiLoaded: boolean, signedIn: boolean}) {

  const [calendarId, setCalendarId] = useState('primary');

  if(!props.apiLoaded) {
    return (
      <span>Waiting for google api to load...</span>
    )
  }

  return (
    <div>
      <header>
        {props.signedIn
           ? <button onClick={() => signOut()}>SignOut</button>
           : <button onClick={() => signIn()}>Auth</button> }

        <UpcomingEvents calendarId={calendarId}></UpcomingEvents>

        <CalendarSelector newCalendarSelected={setCalendarId}></CalendarSelector>
      </header>
    </div>
  );
}

export default App;
