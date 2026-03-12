module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('STRAPI_DB_HOST'),
      port: env.int('STRAPI_DB_PORT'),
      database: env('STRAPI_DB_NAME'),
      user: env('STRAPI_DB_USER'),
      password: env('STRAPI_DB_PASSWORD'),
      schema: env('public'),
      ssl: false,
    },
    pool: {
      min: env.int(2),
      max: env.int(50),
    },
  },
});
