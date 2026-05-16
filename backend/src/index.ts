import 'dotenv/config';
import { app } from './app.js';
import { pool } from './db/pool.js';

const PORT = Number(process.env.PORT ?? 3001);

async function start() {
  // DB health check
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connection OK');
  } catch (err) {
    console.error('PostgreSQL connection FAILED', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`SyrelaTrust backend listening on port ${PORT}`);
  });
}

start();
