const ZOOM_TOKEN_URL = `https://zoom.us/oauth/token`;
const ZOOM_API_BASE = `https://api.zoom.us/v2`;

let _cachedToken = null;
let _tokenExpiresAt = 0;

/**
 * Fetches a Server-to-Server OAuth access token from Zoom.
 * Caches the token until it expires.
 *
 * @returns {Promise<string>} A valid Zoom access token
 */
export async function getAccessToken() {
  if (_cachedToken && Date.now() < _tokenExpiresAt) {
    return _cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
  ).toString(`base64`);

  const url = `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;

  const response = await fetch(url, {
    method: `POST`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': `application/x-www-form-urlencoded`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoom token request failed (${response.status}): ${body}`);
  }

  const data = await response.json();

  _cachedToken = data.access_token;
  // Expire 60 seconds early to avoid edge-case failures
  _tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return _cachedToken;
}

/**
 * Creates a Zoom meeting.
 *
 * @param {object} options
 * @param {string} options.topic     - Meeting topic / title
 * @param {string} options.startTime - ISO 8601 start time
 * @param {number} options.duration  - Duration in minutes
 * @param {string} [options.timezone] - IANA timezone (e.g. `America/New_York`)
 * @returns {Promise<object>} The created meeting resource
 */
export async function createMeeting({ topic, startTime, duration, timezone }) {
  const token = await getAccessToken();

  const response = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: `POST`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `application/json`,
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration,
      timezone,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoom createMeeting failed (${response.status}): ${body}`);
  }

  return response.json();
}

/**
 * Retrieves details for a Zoom meeting.
 *
 * @param {string|number} meetingId - The Zoom meeting ID
 * @returns {Promise<object>} The meeting resource
 */
export async function getMeeting(meetingId) {
  const token = await getAccessToken();

  const response = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    method: `GET`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoom getMeeting failed (${response.status}): ${body}`);
  }

  return response.json();
}

/**
 * Deletes (cancels) a Zoom meeting.
 *
 * @param {string|number} meetingId - The Zoom meeting ID
 * @returns {Promise<void>}
 */
export async function deleteMeeting(meetingId) {
  const token = await getAccessToken();

  const response = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    method: `DELETE`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoom deleteMeeting failed (${response.status}): ${body}`);
  }
}
