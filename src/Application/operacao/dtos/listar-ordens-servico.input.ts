import { StatusOrdemServico } from "../../../Domain";

// Entrada do ListarOrdensServicoUseCase.
// Filtros da listagem de OS. negocioId é obrigatório: a API nunca deve
// listar OS sem escopo de negócio. Filtros mais relevantes para o futuro
// dashboard: status, clienteId, veiculoId, dataInicio, dataFim.
// status é tipado com o enum do domínio (StatusOrdemServico), não string livre.
export type ListarOrdensServicoInput = {
  negocioId: string;
  status?: StatusOrdemServico;
  clienteId?: string;
  veiculoId?: string;
  orcamentoId?: string;
  busca?: string;
  pagina?: number;
  limite?: number;
  dataInicio?: Date;
  dataFim?: Date;
};
