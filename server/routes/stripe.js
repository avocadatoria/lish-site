import db from '../../db/models/index.js';
import * as stripeService from '../services/stripe.js';

export default async function stripeRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAuth] };

  // ── Raw body parser for webhooks ──────────────────
  // Stripe webhooks need the raw body for signature verification.
  // Register a custom content type parser scoped to this plugin.
  fastify.addContentTypeParser(
    `application/json`,
    { parseAs: `buffer` },
    (req, body, done) => {
      // Attach raw body for webhook verification
      req.rawBody = body;
      try {
        done(null, JSON.parse(body.toString()));
      } catch (err) {
        done(err);
      }
    },
  );

  // ── POST /api/stripe/checkout ─────────────────────
  fastify.post(`/api/stripe/checkout`, auth, async (request, reply) => {
    const { priceId } = request.body;

    const user = await db.User.findByPk(request.user.id);
    if (!user) {
      return reply.code(404).send({ error: `NOT_FOUND`, message: `User not found` });
    }

    // Create Stripe customer if user does not have one
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(` `),
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await user.update({ stripeCustomerId: customerId });
    }

    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${process.env.APP_URL}/billing?success=true`,
      cancelUrl: `${process.env.APP_URL}/billing?canceled=true`,
    });

    return { url: session.url };
  });

  // ── POST /api/stripe/portal ───────────────────────
  fastify.post(`/api/stripe/portal`, auth, async (request, reply) => {
    const user = await db.User.findByPk(request.user.id);
    if (!user?.stripeCustomerId) {
      return reply.code(400).send({
        error: `NO_CUSTOMER`,
        message: `No Stripe customer on file`,
      });
    }

    const session = await stripeService.createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${process.env.APP_URL}/billing`,
    });

    return { url: session.url };
  });

  // ── POST /api/stripe/webhooks ─────────────────────
  fastify.post(`/api/stripe/webhooks`, async (request, reply) => {
    const signature = request.headers[`stripe-signature`];

    let event;
    try {
      event = stripeService.constructWebhookEvent(request.raw.rawBody ?? request.rawBody, signature);
    } catch (err) {
      request.log.warn(`Stripe webhook signature verification failed: ${err.message}`);
      return reply.code(400).send({ error: `WEBHOOK_ERROR`, message: `Invalid signature` });
    }

    switch (event.type) {
      case `checkout.session.completed`: {
        const session = event.data.object;
        if (session.customer) {
          await db.User.update(
            { stripeCustomerId: session.customer },
            { where: { stripeCustomerId: session.customer } },
          );
        }
        break;
      }

      case `customer.subscription.updated`:
      case `customer.subscription.deleted`: {
        // Subscription lifecycle events — extend as needed
        request.log.info({ type: event.type, id: event.data.object.id }, `Subscription event`);
        break;
      }

      default:
        request.log.info({ type: event.type }, `Unhandled Stripe event`);
    }

    return { received: true };
  });

  // ── GET /api/stripe/subscription ──────────────────
  fastify.get(`/api/stripe/subscription`, auth, async (request, reply) => {
    const user = await db.User.findByPk(request.user.id);
    if (!user?.stripeCustomerId) {
      return reply.code(400).send({
        error: `NO_CUSTOMER`,
        message: `No Stripe customer on file`,
      });
    }

    const subscription = await stripeService.getSubscription(user.stripeCustomerId);
    return { subscription };
  });

  // ── GET /api/stripe/products ──────────────────────
  fastify.get(`/api/stripe/products`, async () => {
    const products = await stripeService.listProducts();
    return { products };
  });
}
