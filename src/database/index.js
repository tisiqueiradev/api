const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'api'
});

exports.query = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows;
};

exports.getClient = () => pool.connect();
