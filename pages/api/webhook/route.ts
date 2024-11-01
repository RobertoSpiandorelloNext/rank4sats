import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Processa o evento
    console.log("Evento recebido:", data);

    // Retorna uma resposta de sucesso
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error("Erro ao processar o evento:", error);

    // Verifica se o erro é uma instância de Error para acessar a propriedade 'message' com segurança
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ status: 'error', message });
  }
}
