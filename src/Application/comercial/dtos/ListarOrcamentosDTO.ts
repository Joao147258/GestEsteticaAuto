import { StatusOrcamento } from "../../../Domain";

// Entrada do ListarOrcamentosUseCase.
// Filtros da listagem de orçamentos. negocioId é obrigatório: a API nunca
// deve listar orçamentos sem escopo de negócio.
//
// status é tipado com o enum do domínio (StatusOrcamento), não string livre.
export type ListarOrcamentosDTO = {
  negocioId: string;
  clienteId?: string;
  veiculoId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  status?: StatusOrcamento;
  busca?: string;
  pagina?: number;
  limite?: number;
};
