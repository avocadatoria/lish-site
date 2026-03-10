import { QueryTypes } from 'sequelize';

/**
 * PostgreSQL full-text search across multiple tables.
 *
 * Uses to_tsvector / plainto_tsquery with ts_rank for relevance ordering.
 * Each table gets its own SELECT, combined with UNION ALL.
 *
 * @param {import(`sequelize`).Sequelize} sequelize - Sequelize instance
 * @param {Object} opts
 * @param {string}   opts.query          - Search query string
 * @param {string[]} [opts.tables]       - Tables to search: `User`, `Organization`
 * @param {number}   [opts.limit=20]     - Max results
 * @returns {Promise<{ results: Array<{ type: string, id: string, [key: string]: any }> }>}
 */
export async function fullTextSearch(sequelize, {
  query,
  tables = [`User`, `Organization`],
  limit = 20,
} = {}) {
  if (!query || !query.trim()) {
    return { results: [] };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const selects = [];

  const tableMap = {
    User: {
      table: `"User"`,
      fields: [`email`, `"firstName"`, `"lastName"`],
      select: `
        'user' AS type,
        id,
        email,
        "firstName",
        "lastName"
      `,
    },
    Organization: {
      table: `"Organization"`,
      fields: [`name`, `slug`, `description`],
      select: `
        'organization' AS type,
        id,
        name AS email,
        slug AS "firstName",
        description AS "lastName"
      `,
    },
  };

  for (const tableName of tables) {
    const cfg = tableMap[tableName];
    if (!cfg) continue;

    const tsvector = cfg.fields
      .map((f) => `COALESCE(${f}::text, '')`)
      .join(` || ' ' || `);

    selects.push(`
      SELECT ${cfg.select},
        ts_rank(
          to_tsvector('english', ${tsvector}),
          plainto_tsquery('english', :query)
        ) AS rank
      FROM ${cfg.table}
      WHERE "deletedAt" IS NULL
        AND to_tsvector('english', ${tsvector}) @@ plainto_tsquery('english', :query)
    `);
  }

  if (selects.length === 0) {
    return { results: [] };
  }

  const sql = `
    ${selects.join(`\n    UNION ALL\n    `)}
    ORDER BY rank DESC
    LIMIT :limit
  `;

  const rows = await sequelize.query(sql, {
    replacements: { query, limit: safeLimit },
    type: QueryTypes.SELECT,
  });

  // Re-map Organization results back to their real field names
  const results = rows.map((row) => {
    if (row.type === `organization`) {
      return {
        type: row.type,
        id: row.id,
        name: row.email,
        slug: row.firstName,
        description: row.lastName,
      };
    }
    return {
      type: row.type,
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    };
  });

  return { results };
}
