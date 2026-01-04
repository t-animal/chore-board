# Examples for chores-lib

This folder contains example usage for the Google Calendar adapters in `lib/src`.

## Steps to test

1. Go to https://console.cloud.google.com/auth/clients/ and create a Client with access to ./auth/calendar
2. Add an oauth-client for web and cli and note client ids and secrets
3. Build the library: `npm run build` (from `lib/`).
4. Follow the individual steps

## Node

```bash
npm run build
cd examples
CLIENT_ID=<Client-Id> \
CLIENT_SECRET=<Client-Secret> \
node --experimental-strip-types node-example.mjs
...
CREDENTIALS=<Credentials from first try> \
CLIENT_ID=<Client-Id> \
CLIENT_SECRET=<Client-Secret> \
node --experimental-strip-types node-example.mjs
```

## Browser

Replace CLIENT_ID in `example.html`, then:

```bash
npm run build
python -m http.server
```

Go to http://localhost:8000