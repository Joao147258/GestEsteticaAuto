import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import {
  ChecklistVeiculoProps,
  CriarChecklistVeiculoProps,
  ItemChecklistVeiculoProps,
} from "./ChecklistVeiculoProps";

// ChecklistVeiculo — lista de conferência independente (entrada, execução ou entrega).
// SEPARADA da inspeção: aqui é a conferência, não o estado geral do veículo.
export class ChecklistVeiculo {
  private constructor(private readonly props: ChecklistVeiculoProps) {}

  static criar(props: CriarChecklistVeiculoProps): ChecklistVeiculo {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const ordemServicoId = props.ordemServicoId?.trim();
    if (!ordemServicoId) {
      throw new OperacaoError("Ordem de serviço é obrigatória");
    }
    const veiculoId = props.veiculoId?.trim();
    if (!veiculoId) {
      throw new OperacaoError("Veículo é obrigatório");
    }
    if (!props.itens.length) {
      throw new OperacaoError("Checklist precisa ter ao menos um item");
    }

    const itens: ItemChecklistVeiculoProps[] = props.itens.map((item) => {
      const descricao = item.descricao?.trim();
      if (!descricao) {
        throw new OperacaoError("Descrição do item do checklist é obrigatória");
      }
      return {
        id: randomUUID(),
        descricao,
        marcado: item.marcado ?? false,
        observacoes: item.observacoes?.trim() || null,
      };
    });

    return new ChecklistVeiculo({
      id: randomUUID(),
      negocioId,
      ordemServicoId,
      veiculoId,
      itens,
      responsavelId: props.responsavelId?.trim() || null,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  marcarItem(itemId: string, marcado: boolean): void {
    const item = this.props.itens.find((i) => i.id === itemId);
    if (!item) {
      throw new OperacaoError("Item do checklist não encontrado");
    }
    item.marcado = marcado;
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ChecklistVeiculoProps {
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

  get veiculoId(): string {
    return this.props.veiculoId;
  }

  get itens(): ItemChecklistVeiculoProps[] {
    return this.props.itens.map((item) => ({ ...item }));
  }

  get responsavelId(): string | null | undefined {
    return this.props.responsavelId;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
