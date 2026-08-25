import { randomUUID } from "crypto";
import { ComercialError } from "./ComercialError";
import {
  AceiteOrcamentoProps,
  CriarAceiteOrcamentoProps,
} from "./AceiteOrcamentoProps";
import { CanalAceiteOrcamento } from "./status_aceite_orcamento_types";

// AceiteOrcamento — decisão do cliente sobre a proposta.
// Começa PENDENTE e pode virar ACEITO, RECUSADO ou CANCELADO.
export class AceiteOrcamento {
  private constructor(private readonly props: AceiteOrcamentoProps) {}

  // Obrigatórios: negocioId, orcamentoId e clienteId. Decisão: começa
  // PENDENTE com timestamps de decisão nulos — o aceite é um registro por
  // tentativa (histórico), não o estado final.
  static criar(props: CriarAceiteOrcamentoProps): AceiteOrcamento {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new ComercialError("Negócio é obrigatório");
    }
    const orcamentoId = props.orcamentoId?.trim();
    if (!orcamentoId) {
      throw new ComercialError("Orçamento é obrigatório");
    }
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new ComercialError("Cliente é obrigatório");
    }

    return new AceiteOrcamento({
      id: randomUUID(),
      negocioId,
      orcamentoId,
      clienteId,
      status: "PENDENTE",
      canal: props.canal ?? null,
      aceitoEm: null,
      recusadoEm: null,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: AceiteOrcamentoProps): AceiteOrcamento {
    return new AceiteOrcamento(props);
  }

  // As três decisões (aceitar/recusar/cancelar) exigem status PENDENTE —
  // um aceite já decidido não pode ser redecidido (muda-se a proposta).
  registrarAceite(
    canal?: CanalAceiteOrcamento | null,
    observacoes?: string | null,
  ): void {
    this.validarPendente();
    this.props.status = "ACEITO";
    this.props.canal = canal ?? this.props.canal;
    this.props.aceitoEm = new Date();
    this.props.observacoes = observacoes?.trim() || this.props.observacoes;
    this.props.atualizadoEm = new Date();
  }

  registrarRecusa(
    canal?: CanalAceiteOrcamento | null,
    observacoes?: string | null,
  ): void {
    this.validarPendente();
    this.props.status = "RECUSADO";
    this.props.canal = canal ?? this.props.canal;
    this.props.recusadoEm = new Date();
    this.props.observacoes = observacoes?.trim() || this.props.observacoes;
    this.props.atualizadoEm = new Date();
  }

  cancelar(observacoes?: string | null): void {
    this.validarPendente();
    this.props.status = "CANCELADO";
    this.props.observacoes = observacoes?.trim() || this.props.observacoes;
    this.props.atualizadoEm = new Date();
  }

  private validarPendente(): void {
    if (this.props.status !== "PENDENTE") {
      throw new ComercialError("Aceite não está pendente");
    }
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): AceiteOrcamentoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get orcamentoId(): string {
    return this.props.orcamentoId;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get status(): AceiteOrcamentoProps["status"] {
    return this.props.status;
  }

  get canal(): CanalAceiteOrcamento | null | undefined {
    return this.props.canal;
  }

  get aceitoEm(): Date | null | undefined {
    return this.props.aceitoEm;
  }

  get recusadoEm(): Date | null | undefined {
    return this.props.recusadoEm;
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
