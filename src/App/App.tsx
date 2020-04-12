import React, { useState } from 'react';
import './App.css';
import Configuration, { DefaultConfiguration } from '../components/Configuration';
import { signOut, signIn } from '../lib/authApiFacade';
import UpcomingEvents from '../components/UpcomingEvents';


function App(props: {apiLoaded: boolean; signedIn: boolean}): JSX.Element {

  const [config, setConfig] = useState(DefaultConfiguration);

  if (!props.apiLoaded) {
    return (
      <span>Waiting for google api to load...</span>
    );
  }

  return (
    <>
      <aside className="config">
        {props.signedIn
          ? <button onClick={() => signOut()}>SignOut</button>
          : <button onClick={() => signIn()}>Auth</button> }

        <Configuration configChanged={setConfig}></Configuration>
      </aside>

      <div className="main-container">
        <header>
          <h1>Chores</h1>
        </header>
        <main>
          <UpcomingEvents calendarId={config.selectedCalendar}></UpcomingEvents>
        </main>
      </div>
    </>
  );
}

export default App;
