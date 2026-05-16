import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

/**
 * Run a query inside a transaction with app.user_id set for RLS enforcement.
 * Use for any query that touches RLS-protected tables.
 */
export async function queryWithUser<T extends pg.QueryResultRow = any>(
  userId: string | null,
  text: string,
  values?: any[]
): Promise<pg.QueryResult<T>> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (userId) {
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);
    }
    const result = await client.query<T>(text, values);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Run multiple queries in a single transaction with app.user_id set.
 */
export async function transactionWithUser<T>(
  userId: string | null,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (userId) {
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);
    }
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
