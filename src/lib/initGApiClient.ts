import { CLIENT_ID } from '../api-keys';
import App from '../components/App/App';
import { isUserSignedIn } from './authApiFacade';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
export async function initClient(renderFunction: (appProps: Parameters<typeof App>[0]) => void): Promise<void> {
  try {
    await gapi.client.init({
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES.join(' ')
    });

    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(signedIn => renderFunction({apiLoaded: true, signedIn}));

    renderFunction({apiLoaded: true, signedIn: isUserSignedIn()});
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}
