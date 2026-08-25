import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import {
  ItemOrdemServicoProps,
  CriarItemOrdemServicoProps,
} from "./ItemOrdemServicoProps";

// ItemOrdemServico — um serviço a ser EXECUTADO dentro da ordem.
// Sem lógica comercial (quantidade/valor/desconto) — isso é do módulo comercial.
export class ItemOrdemServico {
  private constructor(private readonly props: ItemOrdemServicoProps) {}

  static criar(props: CriarItemOrdemServicoProps): ItemOrdemServico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const ordemServicoId = props.ordemServicoId?.trim();
    if (!ordemServicoId) {
      throw new OperacaoError("Ordem de serviço é obrigatória");
    }
    const descricao = props.descricao?.trim();
    if (!descricao) {
      throw new OperacaoError("Descrição do item é obrigatória");
    }

    return new ItemOrdemServico({
      id: randomUUID(),
      negocioId,
      ordemServicoId,
      servicoId: props.servicoId?.trim() || null,
      descricao,
      status: "PENDENTE",
      responsavelId: props.responsavelId?.trim() || null,
      iniciadoEm: null,
      finalizadoEm: null,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: ItemOrdemServicoProps): ItemOrdemServico {
    return new ItemOrdemServico(props);
  }

  iniciar(responsavelId?: string | null): void {
    if (this.props.status !== "PENDENTE") {
      throw new OperacaoError("Apenas item PENDENTE pode ser iniciado");
    }
    this.props.status = "EM_EXECUCAO";
    this.props.responsavelId = responsavelId?.trim() || this.props.responsavelId;
    this.props.iniciadoEm = new Date();
    this.props.atualizadoEm = new Date();
  }

  concluir(): void {
    if (this.props.status !== "EM_EXECUCAO" && this.props.status !== "PENDENTE") {
      throw new OperacaoError(
        "Apenas item PENDENTE ou EM_EXECUCAO pode ser concluído",
      );
    }
    this.props.status = "CONCLUIDO";
    this.props.finalizadoEm = new Date();
    this.props.atualizadoEm = new Date();
  }

  cancelar(): void {
    if (this.props.status === "CONCLUIDO" || this.props.status === "CANCELADO") {
      throw new OperacaoError("Item já finalizado não pode ser cancelado");
    }
    this.props.status = "CANCELADO";
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ItemOrdemServicoProps {
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

  get servicoId(): string | null | undefined {
    return this.props.servicoId;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get status(): ItemOrdemServicoProps["status"] {
    return this.props.status;
  }

  get responsavelId(): string | null | undefined {
    return this.props.responsavelId;
  }

  get iniciadoEm(): Date | null | undefined {
    return this.props.iniciadoEm;
  }

  get finalizadoEm(): Date | null | undefined {
    return this.props.finalizadoEm;
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
