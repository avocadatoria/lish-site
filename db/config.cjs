require('dotenv/config');

const shared = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  dialect: 'postgres',
  quoteIdentifiers: true,
  define: {
    freezeTableName: true,
    underscored: false,
    paranoid: true,
    timestamps: true,
  },
};

module.exports = {
  development: { ...shared },
  test: { ...shared, logging: false },
  production: { ...shared, logging: false },
};
