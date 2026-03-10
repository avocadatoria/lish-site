import { google } from 'googleapis';

/**
 * Creates and returns a Google OAuth2 client configured with the
 * application's credentials.
 *
 * @returns {import(`googleapis`).Auth.OAuth2Client}
 */
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

/**
 * Generates a Google OAuth consent URL for calendar access.
 *
 * @param {string} state - Opaque state value for CSRF protection
 * @returns {string} The authorization URL
 */
export function getAuthUrl(state) {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: `offline`,
    prompt: `consent`,
    scope: [`https://www.googleapis.com/auth/calendar`],
    state,
  });
}

/**
 * Exchanges an authorization code for OAuth tokens.
 *
 * @param {string} code - The authorization code from Google callback
 * @returns {Promise<object>} Token set (access_token, refresh_token, etc.)
 */
export async function getTokens(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Lists calendar events for an authenticated user.
 *
 * @param {object} tokens - Google OAuth tokens
 * @param {object} options
 * @param {string} [options.timeMin] - Lower bound (ISO 8601)
 * @param {string} [options.timeMax] - Upper bound (ISO 8601)
 * @param {number} [options.maxResults=50] - Maximum number of events
 * @returns {Promise<Array>} Array of calendar event objects
 */
export async function listEvents(tokens, { timeMin, timeMax, maxResults = 50 } = {}) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: `v3`, auth: oauth2Client });

  const params = {
    calendarId: `primary`,
    singleEvents: true,
    orderBy: `startTime`,
    maxResults,
  };

  if (timeMin) params.timeMin = timeMin;
  if (timeMax) params.timeMax = timeMax;

  const response = await calendar.events.list(params);
  return response.data.items;
}

/**
 * Creates a new calendar event.
 *
 * @param {object} tokens - Google OAuth tokens
 * @param {object} eventData - Google Calendar event resource
 * @returns {Promise<object>} The created event
 */
export async function createEvent(tokens, eventData) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: `v3`, auth: oauth2Client });

  const response = await calendar.events.insert({
    calendarId: `primary`,
    requestBody: eventData,
  });

  return response.data;
}

/**
 * Deletes a calendar event.
 *
 * @param {object} tokens - Google OAuth tokens
 * @param {string} eventId - The ID of the event to delete
 * @returns {Promise<void>}
 */
export async function deleteEvent(tokens, eventId) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: `v3`, auth: oauth2Client });

  await calendar.events.delete({
    calendarId: `primary`,
    eventId,
  });
}
