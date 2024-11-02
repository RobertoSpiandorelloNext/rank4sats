import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Configuração da pool de conexões com o banco de dados (Neon)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    try {
      const client = await pool.connect();

      // Verificar se o site já está registrado
      const checkQuery = 'SELECT id FROM ranked_sites WHERE url = $1';
      const checkResult = await client.query(checkQuery, [website]);

      if (checkResult.rows.length > 0) {
        client.release();
        return res.status(409).json({ error: 'Website is already registered' });
      }

      // Inserir o site no banco de dados
      const insertQuery = `
        INSERT INTO ranked_sites (url, satoshis_paid, visitor_count, first_visitor_paid)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      const values = [website, 0, 0, false];
      const result = await client.query(insertQuery, values); // Check API partner Speed 
      
      client.release();

      const siteId = result.rows[0].id;

      return res.status(200).json({ message: 'Website registered successfully', siteId });
    } catch (error) {
      console.error('Error inserting website:', error);
      return res.status(500).json({ error: 'Database insertion error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
