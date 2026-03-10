import fp from 'fastify-plugin';

async function ssePlugin(fastify) {
  // Map<userId, Set<reply>>
  const clients = new Map();

  function addClient(userId, reply) {
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId).add(reply);
  }

  function removeClient(userId, reply) {
    const userClients = clients.get(userId);
    if (!userClients) return;

    userClients.delete(reply);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  }

  function send(userId, event, data) {
    const userClients = clients.get(userId);
    if (!userClients) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const reply of userClients) {
      reply.raw.write(payload);
    }
  }

  function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const userClients of clients.values()) {
      for (const reply of userClients) {
        reply.raw.write(payload);
      }
    }
  }

  fastify.decorate(`sse`, {
    addClient,
    removeClient,
    send,
    broadcast,
  });
}

export default fp(ssePlugin, {
  name: `sse`,
});
