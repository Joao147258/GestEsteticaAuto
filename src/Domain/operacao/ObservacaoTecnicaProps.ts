import { TipoObservacaoTecnica } from "./tipo_observacao_tecnica_types";

// Propriedades da entidade ObservacaoTecnica.
// Informação importante percebida pela equipe durante a execução.
export interface ObservacaoTecnicaProps {
  id: string;
  negocioId: string;
  ordemServicoId: string;
  itemOrdemServicoId?: string | null;
  tipo: TipoObservacaoTecnica;
  descricao: string;
  responsavelId?: string | null;
  registradaEm: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Dados necessários para criar uma nova ObservacaoTecnica.
export interface CriarObservacaoTecnicaProps {
  negocioId: string;
  ordemServicoId: string;
  itemOrdemServicoId?: string | null;
  tipo: TipoObservacaoTecnica;
  descricao: string;
  responsavelId?: string | null;
  registradaEm?: Date;
}
