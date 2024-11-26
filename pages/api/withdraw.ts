// pages/api/withdraw.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se a requisição é do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount, currency } = req.body;

  // Verifica se os parâmetros necessários foram passados
  if (!amount || !currency) {
    return res.status(400).json({ message: 'Amount and currency are required' });
  }

  // Chave da API armazenada de forma segura (deve ser uma variável de ambiente)
  const API_KEY = process.env.SPEED_API_KEY;

  // Valida se a chave da API está configurada
  if (!API_KEY) {
    return res.status(500).json({ message: 'API key is missing' });
  }

  try {
    // Faz a requisição para a API externa
    const response = await fetch('https://api.tryspeed.com/withdrawal-links', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'speed-version': '2022-10-15',
        'content-type': 'application/json',
        'Authorization': `Basic ${Buffer.from(API_KEY).toString('base64')}`,
      },
      body: JSON.stringify({ amount, currency }),
    });

    // Verifica se a resposta da API externa é bem-sucedida
    if (!response.ok) {
      return res.status(response.status).json({ message: 'Error making request to API' });
    }

    // Obtém os dados da resposta e os envia para o frontend
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
    return res.status(500).json({ message: 'Internal Server Error', error: 'Unknown error' });
  }
}
