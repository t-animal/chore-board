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
          <AuthButton signedIn={props.signedIn}></AuthButton>
        </Drawer>
      </aside>

      <div className="main-container">
        <header>
          <h1>Chores</h1>
        </header>

        <ConfigurationConsumer>
          {context => props.signedIn
            ? <main><UpcomingEvents config={context.config}></UpcomingEvents></main>
            : <AuthButton signedIn={props.signedIn}></AuthButton> }
        </ConfigurationConsumer>
      </div>
    </>
  );
}

export default App;
