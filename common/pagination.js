import { Op } from 'sequelize';

/**
 * Cursor-based pagination helper for Sequelize models.
 *
 * The cursor is a base64-encoded ISO timestamp (createdAt). This avoids
 * UUID ordering issues and gives stable, deterministic pagination when
 * ordering by createdAt DESC.
 *
 * @param {import(`sequelize`).Model} model - Sequelize model class
 * @param {Object} opts
 * @param {string}  [opts.cursor]     - Base64-encoded createdAt timestamp
 * @param {number}  [opts.limit=20]   - Page size (1–100)
 * @param {Object}  [opts.where={}]   - Sequelize where clause
 * @param {Array}   [opts.include=[]] - Sequelize include (eager-load) array
 * @param {Array}   [opts.order]      - Order clause, defaults to createdAt DESC
 * @param {Array}   [opts.attributes] - Column whitelist
 * @returns {Promise<{ data: Array, pagination: { cursor: string|null, hasMore: boolean, total: number } }>}
 */
export async function paginateQuery(model, {
  cursor,
  limit = 20,
  where = {},
  include = [],
  order = [[`createdAt`, `DESC`]],
  attributes,
} = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const paginatedWhere = { ...where };

  if (cursor) {
    try {
      const cursorDate = new Date(Buffer.from(cursor, `base64`).toString(`utf8`));
      paginatedWhere.createdAt = {
        ...paginatedWhere.createdAt,
        [Op.lt]: cursorDate,
      };
    } catch {
      // Invalid cursor — ignore it and return from the beginning
    }
  }

  const queryOpts = {
    where: paginatedWhere,
    include,
    order,
    limit: safeLimit + 1,
  };

  if (attributes) {
    queryOpts.attributes = attributes;
  }

  const { rows, count } = await model.findAndCountAll(queryOpts);

  const hasMore = rows.length > safeLimit;
  const data = hasMore ? rows.slice(0, safeLimit) : rows;

  const lastItem = data[data.length - 1];
  const nextCursor = hasMore && lastItem
    ? Buffer.from(lastItem.createdAt.toISOString()).toString(`base64`)
    : null;

  return {
    data,
    pagination: {
      cursor: nextCursor,
      hasMore,
      total: count,
    },
  };
}
