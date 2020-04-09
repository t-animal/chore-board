import React from 'react';
import './App.css';
import { signOut, signIn } from '../logic/authApiFacade';
import UpcomingEvents from '../components/UpcomingEvents';


function App(props: {signedIn: boolean}) {


  return (
    <div className="App">
      <header className="App-header">
        {props.signedIn
           ? <button onClick={() => signOut()}>SignOut</button>
           : <button onClick={() => signIn()}>Auth</button> }

        <UpcomingEvents></UpcomingEvents>
      </header>
    </div>
  );
}

export default App;
