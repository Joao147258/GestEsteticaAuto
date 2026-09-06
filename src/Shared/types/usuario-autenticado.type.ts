// Informações do usuário autenticado anexadas à requisição HTTP pelo JwtAuthGuard.
export interface UsuarioAutenticado {
  id: string;
  negocioId: string;
  nome: string;
  email: string;
  usuario: string;
  papel: string;
}
