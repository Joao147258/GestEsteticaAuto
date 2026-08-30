// Formato padrão de resposta de erro HTTP da API (V1).
// Todas as exceções — NestJS, Application, Domain, desconhecidas — caem neste
// mesmo formato para o futuro portal administrativo consumir de forma
// consistente. Aqui mora apenas a "casca" da resposta: sem regra de negócio,
// sem acesso a banco. A tradução do erro para status HTTP acontece nos filtros.

export interface CorpoErroHttp {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
  details?: string[];
}

// Reason phrases usados pela API. Não depende de lib externa: apenas os
// códigos que a Presentation realmente produz (validação, negócio, auth, 500).
const REASON_PHRASES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

export function nomeErroHttp(statusCode: number): string {
  return REASON_PHRASES[statusCode] ?? 'Error';
}

// Monta o corpo padronizado de erro.
// Quando `message` é um array (erro de validação do ValidationPipe), a resposta
// usa "Erro de validação" como mensagem e empilha as mensagens individuais em
// `details` — o exemplo do guia da V1.
export function montarCorpoErro(
  statusCode: number,
  message: string | string[],
  path: string,
  error?: string,
): CorpoErroHttp {
  const ehValidacao = Array.isArray(message);

  return {
    statusCode,
    message: ehValidacao ? 'Erro de validação' : message,
    error: error ?? nomeErroHttp(statusCode),
    path,
    timestamp: new Date().toISOString(),
    ...(ehValidacao ? { details: message } : {}),
  };
}
