import { ItemOrdemServicoProps } from "./ItemOrdemServicoProps";
import { InspecaoEntradaProps } from "./InspecaoEntradaProps";
import { ChecklistVeiculoProps } from "./ChecklistVeiculoProps";
import { RegistroFotograficoProps } from "./RegistroFotograficoProps";
import { ObservacaoTecnicaProps } from "./ObservacaoTecnicaProps";
import { StatusOrdemServico } from "./status_ordem_servico_types";
import { RegistroAlteracaoOperacao } from "./operacao_types";

// Propriedades da entidade OrdemServico.
// Representa a execução operacional do serviço no veículo.
// O identificador principal é o `id`; `numero` é apenas amigável/opcional.
export interface OrdemServicoProps {
  id: string;
  negocioId: string;
  clienteId: string;
  veiculoId: string;
  orcamentoId?: string | null;
  agendamentoId?: string | null;
  numero?: string | null;
  itens: ItemOrdemServicoProps[];
  inspecaoEntrada?: InspecaoEntradaProps | null;
  checklist?: ChecklistVeiculoProps | null;
  fotos: RegistroFotograficoProps[];
  observacoesTecnicas: ObservacaoTecnicaProps[];
  status: StatusOrdemServico;
  responsavelId?: string | null;
  abertaEm: Date;
  iniciadaEm?: Date | null;
  pausadaEm?: Date | null;
  finalizadaEm?: Date | null;
  canceladaEm?: Date | null;
  observacoes?: string | null;
  alteracoes: RegistroAlteracaoOperacao[];
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova OrdemServico.
// Nasce ABERTA, sem itens/fotos/observações e com histórico vazio.
export interface CriarOrdemServicoProps {
  negocioId: string;
  clienteId: string;
  veiculoId: string;
  orcamentoId?: string | null;
  agendamentoId?: string | null;
  numero?: string | null;
  responsavelId?: string | null;
  observacoes?: string | null;
}
