// DTO de saída retornado pelo LoginUseCase contendo o token de acesso e dados do usuário.
export interface LoginOutput {
  accessToken: string;
  usuario: {
    id: string;
    negocioId: string;
    nome: string;
    username: string;
    usuario?: string;
    email: string;
    role: string;
    papel?: string;
  };
}
