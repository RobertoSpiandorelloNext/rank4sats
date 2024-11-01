import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import getRawBody from 'raw-body';

const SIGNING_SECRET = process.env.SIGNING_SECRET || ''; // Seu segredo de assinatura

// Função para verificar a assinatura
function verifySignature(signature: string, payload: Buffer, secret: string): boolean {
  const [version, receivedSignature] = signature.split(',');
  if (version !== 'v1') {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = `v1,${hmac.digest('base64')}`;

  const receivedBuffer = Buffer.from(receivedSignature, 'base64');
  const expectedBuffer = Buffer.from(expectedSignature.split(',')[1], 'base64');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const signature = req.headers['webhook-signature'];
      if (!signature || Array.isArray(signature)) {
        return res.status(400).json({ error: 'Missing or invalid signature header' });
      }

      // Obtém o raw body da requisição
      const body = await getRawBody(req);

      const isValidSignature = verifySignature(signature, body, SIGNING_SECRET);

      if (!isValidSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Processa o evento se a assinatura for válida
      console.log("Evento válido recebido:", JSON.parse(body.toString()));

      return res.status(200).json({ message: 'Website registered successfully' });
    } catch (error) {
      console.error("Erro ao processar o evento:", error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
