import React from 'react';
import { signOut, signIn } from '../lib/authApiFacade';

type AuthButtonProps = { signedIn: boolean };

export function AuthButton(props: AuthButtonProps): JSX.Element {

  if (props.signedIn) {
    return <>
      <h3>Authentication</h3>
      You can sign out here and use another account.
      <button onClick={() => signOut()}>SignOut</button> <br/>

      This does not revoke this website&apos;s permissions to your calendar.
      You can do that <a href="https://myaccount.google.com/permissions">in
      your google settings.</a>
    </>;
  } else {
    return <>
      <h3>Authentication</h3>
      You need to sign in to your google account and allow this app access to
      your google calendar.
      <button onClick={() => signIn()}>Sign in and authorize</button> <br/>

      This app needs access to your calendar (to read the available calendars)
      and to your events (to mark an event as done). None of your data
      is sent anywhere (except to google, of course).
    </>;
  }
}
