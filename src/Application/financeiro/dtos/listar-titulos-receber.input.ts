import {
  OrigemTituloFinanceiro,
  StatusTituloFinanceiro,
} from "../../../Domain";

// Entrada do ListarTitulosReceberUseCase.
// Filtros da listagem de títulos a receber. negocioId é obrigatório.
// Filtros importantes para o painel: status, clienteId, dataVencimento
// (início/fim) e origem. status/origem tipados com os enums do domínio.
export type ListarTitulosReceberInput = {
  negocioId: string;

  clienteId?: string;
  origem?: OrigemTituloFinanceiro;
  origemId?: string;
  status?: StatusTituloFinanceiro;

  dataVencimentoInicio?: Date;
  dataVencimentoFim?: Date;

  busca?: string;
  pagina?: number;
  limite?: number;
};
