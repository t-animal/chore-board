import React, { useState } from 'react';
import Drawer from 'rc-drawer';

import './App.css';
import 'rc-drawer/assets/index.css';
import ConfigurationComponent from '../Configuration';
import UpcomingEvents from '../UpcomingEvents';
import { DefaultConfiguration } from '../../lib/storage';
import { AuthButton } from '../AuthButton';


function App(props: {apiLoaded: boolean; signedIn: boolean}): JSX.Element {

  const [config, setConfig] = useState(DefaultConfiguration);
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

          <ConfigurationComponent configChanged={setConfig}></ConfigurationComponent>
          <AuthButton signedIn={props.signedIn}></AuthButton>
        </Drawer>
      </aside>

      <div className="main-container">
        <header>
          <h1>Chores</h1>
        </header>

        { props.signedIn
          ? <main><UpcomingEvents config={config}></UpcomingEvents></main>
          : <AuthButton signedIn={props.signedIn}></AuthButton> }
      </div>
    </>
  );
}

export default App;
