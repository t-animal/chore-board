import React from 'react';
import Drawer from 'rc-drawer';

import './App.css';
import 'rc-drawer/assets/index.css';
import ConfigurationComponent from '../Configuration';
import UpcomingEvents from '../UpcomingEvents';
import { AuthButton } from '../AuthButton';
import { ConfigurationConsumer } from '../ConfigurationContext';


function App(props: {apiLoaded: boolean; signedIn: boolean}): JSX.Element {

  const sidebarRef = React.createRef<HTMLElement>();

  if (!props.apiLoaded) {
    return (
      <span>Waiting for google api to load...</span>
    );
  }

  return (
    <>
      <aside className="config" ref={sidebarRef}>
        <Drawer getContainer={sidebarRef.current}>

          <ConfigurationComponent></ConfigurationComponent>
          <section>
            <AuthButton signedIn={props.signedIn}></AuthButton>
          </section>

          <footer>
            Fork me on <a href="https://github.com/t-animal/chore-board">Github</a>.<br />
            Favicon based on artwork licensed CC-BY
            by <a href="https://thenounproject.com/term/cleaning/1944288/">monkik</a>.
          </footer>
        </Drawer>
      </aside>

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

            return (props.signedIn
              ? <main><UpcomingEvents config={context.config} loadingCalendarsFailed={errorHandler}></UpcomingEvents></main>
              : <AuthButton signedIn={props.signedIn}></AuthButton>);
          }}
        </ConfigurationConsumer>
      </div>
    </>
  );
}

export default App;
