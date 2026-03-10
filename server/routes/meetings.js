import {
  createMeeting,
  getMeeting,
  deleteMeeting,
} from '../services/zoom.js';

/**
 * Meeting routes plugin.
 *
 * Provides Zoom meeting CRUD endpoints under /api/meetings/*.
 */
export default async function meetingRoutes(fastify) {
  // ── POST /api/meetings ─────────────────────────────────
  // Creates a new Zoom meeting.
  fastify.post(`/api/meetings`, {
    preHandler: [fastify.requireAuth],
  }, async (request) => {
    const { topic, startTime, duration, timezone } = request.body;

    const meeting = await createMeeting({ topic, startTime, duration, timezone });

    return {
      id: meeting.id,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
    };
  });

  // ── GET /api/meetings/:id ──────────────────────────────
  // Retrieves Zoom meeting details.
  fastify.get(`/api/meetings/:id`, {
    preHandler: [fastify.requireAuth],
  }, async (request) => {
    const meeting = await getMeeting(request.params.id);
    return meeting;
  });

  // ── POST /api/meetings/:id/cancel ──────────────────────
  // Cancels (deletes) a Zoom meeting.
  fastify.post(`/api/meetings/:id/cancel`, {
    preHandler: [fastify.requireAuth],
  }, async (request) => {
    await deleteMeeting(request.params.id);
    return { ok: true };
  });
}
