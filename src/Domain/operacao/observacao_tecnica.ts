import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import {
  ObservacaoTecnicaProps,
  CriarObservacaoTecnicaProps,
} from "./ObservacaoTecnicaProps";

// ObservacaoTecnica — informação importante percebida pela equipe na execução.
// Vinculada à OrdemServico (lista observacoesTecnicas).
export class ObservacaoTecnica {
  private constructor(private readonly props: ObservacaoTecnicaProps) {}

  static criar(props: CriarObservacaoTecnicaProps): ObservacaoTecnica {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const ordemServicoId = props.ordemServicoId?.trim();
    if (!ordemServicoId) {
      throw new OperacaoError("Ordem de serviço é obrigatória");
    }
    if (!props.tipo) {
      throw new OperacaoError("Tipo da observação é obrigatório");
    }
    const descricao = props.descricao?.trim();
    if (!descricao) {
      throw new OperacaoError("Descrição da observação é obrigatória");
    }

    return new ObservacaoTecnica({
      id: randomUUID(),
      negocioId,
      ordemServicoId,
      itemOrdemServicoId: props.itemOrdemServicoId?.trim() || null,
      tipo: props.tipo,
      descricao,
      responsavelId: props.responsavelId?.trim() || null,
      registradaEm: props.registradaEm ?? new Date(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ObservacaoTecnicaProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get ordemServicoId(): string {
    return this.props.ordemServicoId;
  }

  get itemOrdemServicoId(): string | null | undefined {
    return this.props.itemOrdemServicoId;
  }

  get tipo(): ObservacaoTecnicaProps["tipo"] {
    return this.props.tipo;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get responsavelId(): string | null | undefined {
    return this.props.responsavelId;
  }

  get registradaEm(): Date {
    return this.props.registradaEm;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
