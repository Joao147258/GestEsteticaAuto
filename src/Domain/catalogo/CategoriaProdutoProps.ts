// Propriedades da entidade CategoriaProduto.
// A categoria organiza produtos; não controla produtos dentro dela.
export interface CategoriaProdutoProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova CategoriaProduto.
export interface CriarCategoriaProdutoProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
}
