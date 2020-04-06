import React, { useState } from 'react';
import './App.css';


function App(props: {signedIn: boolean}) {

  const [messages, setMessages] = useState([] as string[]);

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event: React.MouseEvent) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event: React.MouseEvent) {
    gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   */
  function appendPre(newMessages: string[]) {
    setMessages([...messages, ...newMessages]);
  }

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  async function listUpcomingEvents() {
    console.log('listing upcoming events', props, messages)
    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    });
    const events = response.result.items;

    const messagesToAdd = ['Upcoming events:'];

    if (events && events.length > 0) {
      for (let i = 0; i < events.length; i++) {
        var event = events[i];
        var when = event.start?.dateTime;
        if (!when) {
          when = event.start?.date ?? 'unknown date';
        }
        messagesToAdd.push(event.summary + ' (' + when + ')')
      }
    } else {
      messagesToAdd.push('No upcoming events found.');
    }

    appendPre(messagesToAdd);
  }

  if(props.signedIn && messages.length === 0)
    listUpcomingEvents();

  return (
    <div className="App">
      <header className="App-header">
        {props.signedIn
           ? <button onClick={handleSignoutClick}>SignOut</button>
           : <button onClick={handleAuthClick}>Auth</button> }

        <pre>
          { messages.join('\n') }
        </pre>
      </header>
    </div>
  );
}

export default App;
