import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import { AgendamentoProps, CriarAgendamentoProps } from "./AgendamentoProps";

// Agendamento — horário marcado para um atendimento.
// Conecta agendaId, clienteId, veiculoId, orcamentoId e ordemServicoId.
export class Agendamento {
  private constructor(private readonly props: AgendamentoProps) {}

  static criar(props: CriarAgendamentoProps): Agendamento {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new OperacaoError("Cliente é obrigatório");
    }
    if (!props.inicio) {
      throw new OperacaoError("Data de início é obrigatória");
    }
    if (props.duracaoEstimadaMinutos != null && props.duracaoEstimadaMinutos < 0) {
      throw new OperacaoError("Duração estimada não pode ser negativa");
    }

    return new Agendamento({
      id: randomUUID(),
      negocioId,
      agendaId: props.agendaId?.trim() || null,
      clienteId,
      veiculoId: props.veiculoId?.trim() || null,
      orcamentoId: props.orcamentoId?.trim() || null,
      ordemServicoId: null,
      inicio: props.inicio,
      fim: null,
      duracaoEstimadaMinutos: props.duracaoEstimadaMinutos ?? null,
      status: "AGENDADO",
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: AgendamentoProps): Agendamento {
    return new Agendamento(props);
  }

  confirmar(): void {
    if (this.props.status !== "AGENDADO") {
      throw new OperacaoError("Apenas agendamento AGENDADO pode ser confirmado");
    }
    this.props.status = "CONFIRMADO";
    this.props.atualizadoEm = new Date();
  }

  iniciarAtendimento(): void {
    if (this.props.status !== "AGENDADO" && this.props.status !== "CONFIRMADO") {
      throw new OperacaoError(
        "Apenas agendamento AGENDADO ou CONFIRMADO pode iniciar atendimento",
      );
    }
    this.props.status = "EM_ATENDIMENTO";
    this.props.atualizadoEm = new Date();
  }

  concluir(): void {
    if (this.props.status !== "EM_ATENDIMENTO" && this.props.status !== "CONFIRMADO") {
      throw new OperacaoError(
        "Apenas agendamento CONFIRMADO ou EM_ATENDIMENTO pode ser concluído",
      );
    }
    this.props.status = "CONCLUIDO";
    this.props.fim = new Date();
    this.props.atualizadoEm = new Date();
  }

  cancelar(motivo?: string | null): void {
    if (this.props.status === "CONCLUIDO") {
      throw new OperacaoError("Agendamento concluído não pode ser cancelado");
    }
    if (
      this.props.status === "CANCELADO" ||
      this.props.status === "NAO_COMPARECEU"
    ) {
      throw new OperacaoError("Agendamento já encerrado");
    }
    this.props.status = "CANCELADO";
    this.props.observacoes = motivo?.trim() || this.props.observacoes;
    this.props.atualizadoEm = new Date();
  }

  registrarNaoComparecimento(): void {
    if (this.props.status === "CONCLUIDO") {
      throw new OperacaoError(
        "Agendamento concluído não pode registrar não comparecimento",
      );
    }
    if (
      this.props.status === "CANCELADO" ||
      this.props.status === "NAO_COMPARECEU"
    ) {
      throw new OperacaoError("Agendamento já encerrado");
    }
    this.props.status = "NAO_COMPARECEU";
    this.props.atualizadoEm = new Date();
  }

  alterarHorario(inicio: Date, duracaoEstimadaMinutos?: number | null): void {
    if (
      this.props.status === "CONCLUIDO" ||
      this.props.status === "CANCELADO" ||
      this.props.status === "NAO_COMPARECEU"
    ) {
      throw new OperacaoError("Agendamento encerrado não pode ter horário alterado");
    }
    if (!inicio) {
      throw new OperacaoError("Data de início é obrigatória");
    }
    if (duracaoEstimadaMinutos != null && duracaoEstimadaMinutos < 0) {
      throw new OperacaoError("Duração estimada não pode ser negativa");
    }
    this.props.inicio = inicio;
    if (duracaoEstimadaMinutos !== undefined) {
      this.props.duracaoEstimadaMinutos = duracaoEstimadaMinutos;
    }
    this.props.atualizadoEm = new Date();
  }

  vincularOrdemServico(ordemServicoId: string): void {
    const id = ordemServicoId?.trim();
    if (!id) {
      throw new OperacaoError("Ordem de serviço é obrigatória");
    }
    this.props.ordemServicoId = id;
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): AgendamentoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get agendaId(): string | null | undefined {
    return this.props.agendaId;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get veiculoId(): string | null | undefined {
    return this.props.veiculoId;
  }

  get orcamentoId(): string | null | undefined {
    return this.props.orcamentoId;
  }

  get ordemServicoId(): string | null | undefined {
    return this.props.ordemServicoId;
  }

  get inicio(): Date {
    return this.props.inicio;
  }

  get fim(): Date | null | undefined {
    return this.props.fim;
  }

  get duracaoEstimadaMinutos(): number | null | undefined {
    return this.props.duracaoEstimadaMinutos;
  }

  get status(): AgendamentoProps["status"] {
    return this.props.status;
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
