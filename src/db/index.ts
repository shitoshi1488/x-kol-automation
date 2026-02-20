import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://x_kol_user:password@localhost:5432/x_kol'
});

export const db = {
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Executed query:', {
      text,
      duration,
      rows: result.rowCount
    });
    
    return result;
  },
  
  getClient: async () => {
    return await pool.connect();
  },
  
  end: () => {
    return pool.end();
  }
};