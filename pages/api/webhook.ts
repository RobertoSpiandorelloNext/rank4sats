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
    rejectUnauthorized: false, // Para desenvolvimento, desative em produção
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const signature = req.headers['webhook-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing or invalid signature header' });
      }

      // Acessa o corpo da requisição diretamente
      const body = req.body; // Não é necessário usar await aqui

      if (body.event_type === "payment.confirmed") {
        const client = await pool.connect();

        const insertQuery = `
          INSERT INTO payments (webhook_event)
          VALUES ($1)
          RETURNING id;
        `;

        const values = [JSON.stringify(body)];
        const result = await client.query(insertQuery, values);
        client.release();
        
        const paymentId = result.rows[0].id;
        return res.status(200).json({ message: 'Confirmed payment registered successfully', paymentId });
      }
      return res.status(200).json({ message: 'Event triggered but not a confirmed payment' });
    } catch (error) {
      console.error('Error processing request:', error); // Log do erro
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
