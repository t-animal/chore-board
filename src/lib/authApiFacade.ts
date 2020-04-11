export function signOut(): void {
  gapi.auth2.getAuthInstance().signOut();
}

export function signIn(): void {
  gapi.auth2.getAuthInstance().signIn();
}

export function isUserSignedIn(): boolean {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
}
