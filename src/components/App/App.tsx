import React from 'react';

import './App.css';
import 'rc-drawer/assets/index.css';
import UpcomingEvents from '../UpcomingEvents';
import { AuthButton } from '../AuthButton';
import { ConfigurationConsumer } from '../ConfigurationContext';
import { Sidebar } from '../Sidebar';
import { SelectOrCreateCalendar } from '../SelectOrCreateCalendar';

function App(props: {apiLoaded: boolean; signedIn: boolean}): JSX.Element {


  if (!props.apiLoaded) {
    return (
      <span>Waiting for google api to load...</span>
    );
  }

  return (
    <>
      <Sidebar signedIn={props.signedIn}/>

      <div className="main-container">
        <header>
          <h1>Chores</h1>
        </header>

        <ConfigurationConsumer>
          {context => {

            const errorHandler = (e: any): void => {
              console.error(e);
              if (e?.status === 404) {
                alert('Could not load calendar. Google says it\'s not existing. Please choose a different one.');
                context.mutators.setCalendar(null);
              }
            };

            if (!props.signedIn) {
              return <AuthButton signedIn={props.signedIn} />;
            }

            if (context.config.selectedCalendar === null) {
              return <SelectOrCreateCalendar />;
            }

            return <UpcomingEvents config={context.config} loadingCalendarsFailed={errorHandler} />;
          }}
        </ConfigurationConsumer>
      </div>
    </>
  );
}

export default App;
