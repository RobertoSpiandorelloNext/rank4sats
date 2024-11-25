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

//

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', req.method, req.headers); // Log do método e cabeçalhos da requisição

  if (req.method === 'POST') {
    try {
      const signature = req.headers['webhook-signature'];
      console.log('Webhook signature:', signature); // Log da assinatura do webhook

      if (!signature) {
        return res.status(400).json({ error: 'Missing or invalid signature header' });
      }

      // Acessa o corpo da requisição diretamente
      const body = req.body; // Não é necessário usar await aqui

      if (body.data.object.metadata.siteId) {
        console.log('Request body:', JSON.stringify(body)); // Log do corpo da requisição

        console.log('Processing event...'); // Log informativo sobre o processamento

        const client = await pool.connect();
        console.log('Database connection established.'); // Log de conexão ao banco

        const insertQuery = `
          INSERT INTO payments (webhook_event)
          VALUES ($1)
          RETURNING id;
        `;

        const values = [JSON.stringify(body)];
        console.log('Executing query:', insertQuery, 'with values:', values); // Log da consulta SQL

        const result = await client.query(insertQuery, values);
        console.log('Insert result:', result); // Log do resultado da inserção

        client.release();
        console.log('Database connection released.'); // Log de liberação da conexão

        const paymentId = result.rows[0].id;
        return res.status(200).json({ message: 'Confirmed payment registered successfully', paymentId });
      }
  
    } catch (error) {
      console.error('Error processing request:', error); // Log do erro
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    console.log('Method not allowed:', req.method); // Log do método não permitido
    return res.status(405).json({ error: 'Method not allowed' });
  }
}