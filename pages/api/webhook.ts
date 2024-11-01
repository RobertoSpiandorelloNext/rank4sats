import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = req.body; // O `body` já deve conter o JSON no Next.js

      // Processa o evento
      console.log("Evento recebido:", data);

      return res.status(200).json({ message: 'Website registered successfully', data });
    } catch (error) {
      console.error("Erro ao processar o evento:", error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
