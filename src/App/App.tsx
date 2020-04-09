import React, { useState } from 'react';
import './App.css';
import { getAllUpcomingEvents } from '../logic/calendarApiFacade';
import { signOut, signIn } from '../logic/authApiFacade';


function App(props: {signedIn: boolean}) {

  const [messages, setMessages] = useState([] as string[]);

  function addMessages(newMessages: string[]) {
    setMessages([...messages, ...newMessages]);
  }

  async function listUpcomingEvents() {
    const events = await getAllUpcomingEvents();

    const messagesToAdd = ['Upcoming events:'];

    if (!events || events.length  === 0) {
      return [...messagesToAdd, 'No upcoming events found'];
    }

    for (const event of events) {
      let when = event.start?.dateTime;
      if (!when) {
        when = event.start?.date ?? 'unknown date';
      }
      messagesToAdd.push(event.summary + ' (' + when + ')')
    }

    addMessages(messagesToAdd);
  }

  if(props.signedIn && messages.length === 0)
    listUpcomingEvents();

  return (
    <div className="App">
      <header className="App-header">
        {props.signedIn
           ? <button onClick={() => signOut()}>SignOut</button>
           : <button onClick={() => signIn()}>Auth</button> }

        <pre>
          { messages.join('\n') }
        </pre>
      </header>
    </div>
  );
}

export default App;
