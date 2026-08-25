// Propriedades da entidade OrigemCliente.
// É uma entidade raiz (escopada pelo tenant), referenciada por Cliente via origemId.
export interface OrigemClienteProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova OrigemCliente.
export interface CriarOrigemClienteProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
}
