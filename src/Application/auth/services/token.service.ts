// Payload contido no token de autenticação JWT da V1.
export interface TokenPayload {
  sub: string;
  negocioId: string;
  nome: string;
  email: string;
  papel: string;
}

// Contrato de infraestrutura para assinatura e verificação de tokens de autenticação.
// A Application depende apenas deste contrato, desacoplada da biblioteca concreta (jsonwebtoken).
export abstract class TokenService {
  abstract gerarToken(payload: TokenPayload): Promise<string>;
  abstract verificarToken(token: string): Promise<TokenPayload>;
}
