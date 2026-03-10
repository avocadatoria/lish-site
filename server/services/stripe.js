import Stripe from 'stripe';

let stripe = null;

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/**
 * Create a Stripe customer for a user.
 */
export async function createCustomer({ email, name, metadata }) {
  return getStripe().customers.create({ email, name, metadata });
}

/**
 * Create a Stripe Checkout session.
 */
export async function createCheckoutSession({ customerId, priceId, successUrl, cancelUrl }) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    mode: `subscription`,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Create a Stripe Customer Portal session.
 */
export async function createPortalSession({ customerId, returnUrl }) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Verify and construct a Stripe webhook event.
 */
export function constructWebhookEvent(rawBody, signature) {
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

/**
 * Retrieve the active subscription for a customer.
 * Returns the first active subscription, or null if none.
 *
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<object|null>}
 */
export async function getSubscription(customerId) {
  const subscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: `active`,
    expand: [`data.items.data.price.product`],
    limit: 1,
  });
  return subscriptions.data[0] || null;
}

/**
 * List active products with their prices.
 */
export async function listProducts() {
  const products = await getStripe().products.list({ active: true, expand: [`data.default_price`] });
  return products.data;
}
