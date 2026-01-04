#!/usr/bin/env node

/* Node example (ESM). Usage:
 * CLIENT_ID=... CLIENT_SECRET=... node --experimental-strip-types node-example.ts
 */

import readlinePromises from "node:readline/promises";
import { google } from "googleapis";
import { getGcalApi, listCalendars } from "../dist/calendar-facade.js";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const credentials = process.env.CREDENTIALS;

async function main() {
  if (!clientId || !clientSecret) {
    console.error(
      "Please set CLIENT_ID and CLIENT_SECRET environment variables."
    );
    process.exit(2);
  }

  try {
    const api = await getGcalApi({
      oauth2Client: await authorizeOauthClient(clientId, clientSecret, credentials),
    }, "node");

    const calendars = await listCalendars(api);
    console.log("Calendars:");
    console.dir(calendars, { depth: 2 });
  } catch (err) {
    console.error("Error during OAuth or API call:", err);
    process.exit(1);
  }
}

/**
 * Authorize an OAuth2 client.
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string} [existingCredentials]
 * @returns {Promise<import("googleapis").Auth.OAuth2Client>}
 */
async function authorizeOauthClient(clientId, clientSecret, existingCredentials) {
  const redirectUri = "urn:ietf:wg:oauth:2.0:oob"; // Print the code to the website, copy and paste into the app

  const oauth2Client = new google.auth.OAuth2({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
  });

  if (existingCredentials) {
    oauth2Client.setCredentials(JSON.parse(Buffer.from(existingCredentials, "base64").toString("utf-8")));
    return oauth2Client;
  }

  const code = await promptForCode(oauth2Client);

  const credentials = await oauth2Client.getToken(code);

  console.log("Set this CREDENTIALS environment variable to skip authorization next time: ");
  console.log(Buffer.from(JSON.stringify(credentials.tokens), "utf-8").toString("base64"));
  
  oauth2Client.setCredentials(credentials.tokens);

  return oauth2Client;
}

/**
 * Prompt the user for an authorization code.
 * @param {import("googleapis").Auth.OAuth2Client} oauth2Client
 * @returns {Promise<string>}
 */
async function promptForCode(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // TODO: is this needed?
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  console.log(`Authorize this app by visiting this url: ${authUrl}`);

  const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await rl.question(
    `Enter the authorization code from the page here: `
  );
  rl.close();

  if (!code) {
    throw new Error("No authorization code provided");
  }

  return code;
}

main();
