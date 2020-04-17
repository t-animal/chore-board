import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import './spinner.css';

import App from './components/App/App';

import { initClient } from './lib/initGApiClient';
import { ConfigurationProvider } from './components/ConfigurationContext';

const render = (appProps: Parameters<typeof App>[0]): void => {

  ReactDOM.render(
    <React.StrictMode>
      <ConfigurationProvider>
        <App {...appProps}/>
      </ConfigurationProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

render({apiLoaded: false, signedIn: false});

/**
 *  On load, called to load the auth2 library and API client library.
 *  called from index.html
 *  eslint-disable-next-line @typescript-eslint/no-unused-vars
 */
function handleClientLoad(): void {
  gapi.load('client:auth2', () => initClient(render));
}

(window as typeof window & {handleClientLoad: () => void}).handleClientLoad = handleClientLoad;
