import fp from 'fastify-plugin';
import { getIronSession } from 'iron-session';

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: process.env.SESSION_COOKIE_NAME,
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: `lax`,
    maxAge: 365 * 24 * 60 * 60,
  },
};

async function sessionPlugin(fastify) {
  fastify.decorateRequest(`getSession`, null);

  fastify.addHook(`preHandler`, async (request, reply) => {
    request.getSession = async () => {
      return getIronSession(request.raw, reply.raw, sessionOptions);
    };
  });
}

export default fp(sessionPlugin, {
  name: `session`,
});
