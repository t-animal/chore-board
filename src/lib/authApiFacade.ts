export function signOut() {
  gapi.auth2.getAuthInstance().signOut();
}

export function signIn() {
  gapi.auth2.getAuthInstance().signIn();
}

export function isUserSignedIn() {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
}
