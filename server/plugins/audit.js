import fp from 'fastify-plugin';
import db from '../../db/models/index.js';

async function auditPlugin(fastify) {
  async function log(userId, action, resource, resourceId, metadata, ipAddress) {
    await db.AuditLog.create({
      userId,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress,
    });
  }

  fastify.decorate(`audit`, { log });
}

export default fp(auditPlugin, {
  name: `audit`,
});
