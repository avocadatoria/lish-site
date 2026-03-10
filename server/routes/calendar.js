import crypto from 'node:crypto';
import db from '../../db/models/index.js';
import {
  getAuthUrl,
  getTokens,
  listEvents,
  createEvent,
  deleteEvent,
} from '../services/google-calendar.js';

const { UserAttribute } = db;

const TOKENS_KEY = `google_calendar_tokens`;

/**
 * Retrieves the stored Google Calendar tokens for a user.
 *
 * @param {string} userId
 * @returns {Promise<object|null>} Parsed tokens or null
 */
async function getUserTokens(userId) {
  const attr = await UserAttribute.findOne({
    where: { userId, key: TOKENS_KEY },
  });

  if (!attr || !attr.textValue) return null;
  return JSON.parse(attr.textValue);
}

/**
 * Calendar routes plugin.
 *
 * Provides Google Calendar OAuth + CRUD endpoints under /api/calendar/*.
 */
export default async function calendarRoutes(fastify) {
  // ── GET /api/calendar/connect ──────────────────────────
  // Initiates Google OAuth flow. Stores state in session and redirects
  // the browser to the Google consent screen.
  fastify.get(`/api/calendar/connect`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const session = await request.getSession();

    const state = crypto.randomBytes(32).toString(`hex`);
    session.googleCalendarState = state;
    await session.save();

    const authUrl = getAuthUrl(state);
    return reply.redirect(authUrl);
  });

  // ── GET /api/calendar/callback ─────────────────────────
  // Google redirects here after the user authorizes. Validates state,
  // exchanges the code for tokens, and stores them in UserAttribute.
  fastify.get(`/api/calendar/callback`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const { code, state } = request.query;
    const session = await request.getSession();

    if (!state || state !== session.googleCalendarState) {
      return reply.code(400).send({ error: `INVALID_STATE` });
    }

    delete session.googleCalendarState;
    await session.save();

    const tokens = await getTokens(code);

    await UserAttribute.upsert({
      userId: request.user.id,
      key: TOKENS_KEY,
      textValue: JSON.stringify(tokens),
    });

    return reply.redirect(`/dashboard/calendar`);
  });

  // ── GET /api/calendar/events ───────────────────────────
  // Lists the authenticated user's calendar events.
  fastify.get(`/api/calendar/events`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const tokens = await getUserTokens(request.user.id);

    if (!tokens) {
      return reply.code(400).send({
        error: `NOT_CONNECTED`,
        message: `Google Calendar is not connected — visit /api/calendar/connect`,
      });
    }

    const { timeMin, timeMax, maxResults } = request.query;

    const events = await listEvents(tokens, {
      timeMin,
      timeMax,
      maxResults: maxResults ? Number(maxResults) : undefined,
    });

    return { events };
  });

  // ── POST /api/calendar/events ──────────────────────────
  // Creates a new calendar event.
  fastify.post(`/api/calendar/events`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const tokens = await getUserTokens(request.user.id);

    if (!tokens) {
      return reply.code(400).send({
        error: `NOT_CONNECTED`,
        message: `Google Calendar is not connected — visit /api/calendar/connect`,
      });
    }

    const event = await createEvent(tokens, request.body);
    return { event };
  });

  // ── DELETE /api/calendar/events/:eventId ───────────────
  // Deletes a calendar event by ID.
  fastify.delete(`/api/calendar/events/:eventId`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const tokens = await getUserTokens(request.user.id);

    if (!tokens) {
      return reply.code(400).send({
        error: `NOT_CONNECTED`,
        message: `Google Calendar is not connected — visit /api/calendar/connect`,
      });
    }

    await deleteEvent(tokens, request.params.eventId);
    return { ok: true };
  });
}
