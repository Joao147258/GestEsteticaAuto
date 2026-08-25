// Propriedades da entidade CategoriaServico.
// A categoria organiza serviços; não controla execução.
export interface CategoriaServicoProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova CategoriaServico.
export interface CriarCategoriaServicoProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
}
