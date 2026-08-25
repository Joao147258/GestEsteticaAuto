import { StatusItemOrdemServico } from "./status_item_ordem_servico_types";

// Propriedades da entidade ItemOrdemServico.
// Representa um serviço a ser EXECUTADO (sem lógica comercial de venda).
// Preserva a descrição do serviço, pois o catálogo pode mudar futuramente.
export interface ItemOrdemServicoProps {
  id: string;
  negocioId: string;
  ordemServicoId: string;
  servicoId?: string | null;
  descricao: string;
  status: StatusItemOrdemServico;
  responsavelId?: string | null;
  iniciadoEm?: Date | null;
  finalizadoEm?: Date | null;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar um novo ItemOrdemServico.
export interface CriarItemOrdemServicoProps {
  negocioId: string;
  ordemServicoId: string;
  servicoId?: string | null;
  descricao: string;
  responsavelId?: string | null;
  observacoes?: string | null;
}
