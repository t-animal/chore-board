import React from 'react';
import Drawer from 'rc-drawer';

import ConfigurationComponent from './Configuration';
import { AuthButton } from './AuthButton';

export function Sidebar(props: {signedIn: boolean}): JSX.Element {
  const sidebarRef = React.createRef<HTMLElement>();

  return (
    <aside className="config" ref={sidebarRef}>
      <Drawer getContainer={sidebarRef.current}>

        <ConfigurationComponent></ConfigurationComponent>
        <section>
          <AuthButton signedIn={props.signedIn}></AuthButton>
        </section>

        <section>
          <h3>Create new chores</h3>
          Please use <a href="https://calendar.google.com/calendar/r/eventedit">google calendar</a>.
          Make sure to set the right calendar. You can use event-colors.
        </section>

        <footer>
          Fork me on <a href="https://github.com/t-animal/chore-board">Github</a>.<br />
          Favicon based on artwork licensed CC-BY
          by <a href="https://thenounproject.com/term/cleaning/1944288/">monkik</a>.
        </footer>
      </Drawer>
    </aside>
  );
}
