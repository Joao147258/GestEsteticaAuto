// Tipo de referência de um item de tabela de preço.
export type TipoReferenciaTabelaPreco = "PRODUTO" | "SERVICO" | "PACOTE";

// Item de uma tabela de preço: aponta para uma referência do catálogo com um valor.
export interface ItemTabelaPrecoProps {
  id: string;
  referenciaId: string;
  tipoReferencia: TipoReferenciaTabelaPreco;
  valor: number;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Propriedades da entidade TabelaPreco.
// Conjunto de preços alternativos por contexto (padrão, promoção, frota etc.).
export interface TabelaPrecoProps {
  id: string;
  negocioId: string;
  nome: string;
  descricao?: string | null;
  ativa: boolean;
  itens: ItemTabelaPrecoProps[];
  vigenciaInicio?: Date | null;
  vigenciaFim?: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova TabelaPreco.
export interface CriarTabelaPrecoProps {
  negocioId: string;
  nome: string;
  descricao?: string | null;
  vigenciaInicio?: Date | null;
  vigenciaFim?: Date | null;
}
