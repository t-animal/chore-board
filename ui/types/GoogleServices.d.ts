declare global {
  interface Window {
    googleIdentityServicesLoaded: Promise<void>;
    googleApisLoaded: Promise<void>;

    googleIdentityServicesLoadedCallback: (() => void) | undefined;
    googleApisLoadedCallback: (() => void) | undefined;
  }
}

export {};
