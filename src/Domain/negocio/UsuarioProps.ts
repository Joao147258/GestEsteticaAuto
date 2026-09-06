// Propriedades da entidade Usuario.
// Usuario pertence a um Negocio (referência por id). Sem autenticação/permissões nesta etapa.
export interface UsuarioProps {
  id: string;
  negocioId: string;
  nome: string;
  email: string;
  senhaHash: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo Usuario.
export interface CriarUsuarioProps {
  negocioId: string;
  nome: string;
  email: string;
  senhaHash?: string;
}
