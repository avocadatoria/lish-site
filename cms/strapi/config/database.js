module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('STRAPI_DB_HOST', 'localhost'),
      port: env.int('STRAPI_DB_PORT', 5432),
      database: env('STRAPI_DB_NAME', 'scaffold_strapi'),
      user: env('STRAPI_DB_USER', 'postgres'),
      password: env('STRAPI_DB_PASSWORD', 'postgres'),
      schema: env('STRAPI_DB_SCHEMA', 'public'),
      ssl: false,
    },
    pool: {
      min: env.int('STRAPI_DB_POOL_MIN', 2),
      max: env.int('STRAPI_DB_POOL_MAX', 10),
    },
  },
});
