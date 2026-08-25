// Propriedades da entidade TagCliente.
// Tag é raiz (escopada pelo tenant) e relaciona-se com Cliente via N:M.
export interface TagClienteProps {
  id: string;
  negocioId: string;
  nome: string;
  cor?: string | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova TagCliente.
export interface CriarTagClienteProps {
  negocioId: string;
  nome: string;
  cor?: string | null;
}
