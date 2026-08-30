import {
  OrigemTituloFinanceiro,
  TipoParcelaFinanceira,
} from "../../../Domain";

// Entrada do GerarTituloReceberUseCase: cria uma cobrança (título a receber).
// V1: o título nasce principalmente de um orçamento (origem ORCAMENTO +
// origemId = orcamentoId); ORDEM_SERVICO fica previsto para quando o
// financeiro nascer da conclusão da OS.
// Adaptação ao domínio: campo origem (não "origemTipo"), valorOriginal (o
// domínio calcula valorTotal = original - desconto + acréscimo) e descricao
// obrigatória. Parcelas são obrigatórias no domínio (ao menos 1); o sinal é
// uma parcela com tipo SINAL.
export type GerarTituloReceberInput = {
  negocioId: string;

  origem: OrigemTituloFinanceiro;
  origemId: string;

  clienteId: string;
  descricao: string;
  valorOriginal: number;
  valorDesconto?: number;
  valorAcrescimo?: number;

  dataEmissao?: Date;
  dataVencimento?: Date;

  parcelas: {
    numero: number;
    tipo: TipoParcelaFinanceira;
    descricao?: string;
    valorOriginal: number;
    dataVencimento: Date;
  }[];

  observacoes?: string;
};
