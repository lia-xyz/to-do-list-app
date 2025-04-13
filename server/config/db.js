import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: 'server/config/testconfig.env' });
} else {
  dotenv.config({ path: 'server/config/config.env' });
}

import pkg from 'pg';
const { Pool } = pkg;


const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

 export default db;