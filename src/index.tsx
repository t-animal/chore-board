import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import './spinner.css';

import App from './App/App';
import * as serviceWorker from './serviceWorker';

import { initClient } from './lib/initGApiClient';

const render = (appProps: Parameters<typeof App>[0]): void => {
  ReactDOM.render(
    <React.StrictMode>
      <App {...appProps}/>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

render({apiLoaded: false, signedIn: false});


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

/**
 *  On load, called to load the auth2 library and API client library.
 *  called from index.html
 *  eslint-disable-next-line @typescript-eslint/no-unused-vars
 */
function handleClientLoad(): void {
  gapi.load('client:auth2', () => initClient(render));
}

(window as typeof window & {handleClientLoad: () => void}).handleClientLoad = handleClientLoad;
