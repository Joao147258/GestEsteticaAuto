import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import { AgendaProps, CriarAgendaProps } from "./AgendaProps";
import { AgendamentoProps } from "./AgendamentoProps";

// Agenda — organiza os agendamentos do negócio.
// Na primeira versão, uma agenda principal já basta.
export class Agenda {
  private constructor(private readonly props: AgendaProps) {}

  static criar(props: CriarAgendaProps): Agenda {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new OperacaoError("Nome da agenda é obrigatório");
    }

    return new Agenda({
      id: randomUUID(),
      negocioId,
      nome,
      agendamentos: [],
      ativa: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  adicionarAgendamento(agendamento: AgendamentoProps): void {
    if (!this.props.ativa) {
      throw new OperacaoError("Agenda inativa não recebe agendamentos");
    }
    this.props.agendamentos.push({ ...agendamento });
    this.props.atualizadoEm = new Date();
  }

  ativar(): void {
    if (!this.props.ativa) {
      this.props.ativa = true;
      this.props.atualizadoEm = new Date();
    }
  }

  inativar(): void {
    if (this.props.ativa) {
      this.props.ativa = false;
      this.props.atualizadoEm = new Date();
    }
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): AgendaProps {
    return {
      ...this.props,
      agendamentos: this.props.agendamentos.map((agendamento) => ({ ...agendamento })),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get agendamentos(): AgendamentoProps[] {
    return this.props.agendamentos.map((agendamento) => ({ ...agendamento }));
  }

  get ativa(): boolean {
    return this.props.ativa;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
