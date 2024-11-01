import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const signature = req.headers['webhook-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing or invalid signature header' });
      }

      // Acessa o corpo da requisição diretamente
      const body = await req.body;

      return res.status(200).json({ message: 'Website registered successfully', body });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}