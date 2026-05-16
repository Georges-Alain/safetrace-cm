require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    pool: { min: 2, max: 10 }
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    pool: { min: 1, max: 5 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    pool: { min: 2, max: 20 }
  }
};
