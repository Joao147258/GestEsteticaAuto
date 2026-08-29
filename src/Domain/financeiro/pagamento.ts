import { randomUUID } from "crypto";
import { FinanceiroError } from "./FinanceiroError";
import { CriarPagamentoProps, PagamentoProps } from "./PagamentoProps";
import { StatusPagamento } from "./financeiro_types";

// Pagamento — a baixa de uma ParcelaFinanceira.
// Nasce PENDENTE; ao ser confirmado passa a compor o valorPago da parcela.
// Um pagamento pode quitar toda a parcela ou apenas parte dela.
export class Pagamento {
  private constructor(private readonly props: PagamentoProps) {}

  // Obrigatórios: negocioId, tituloFinanceiroId, parcelaFinanceiraId, valor
  // e forma de pagamento. Nasce como PENDENTE.
  static criar(props: CriarPagamentoProps): Pagamento {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new FinanceiroError("Negócio é obrigatório");
    }
    const tituloFinanceiroId = props.tituloFinanceiroId?.trim();
    if (!tituloFinanceiroId) {
      throw new FinanceiroError("Título financeiro é obrigatório");
    }
    const parcelaFinanceiraId = props.parcelaFinanceiraId?.trim();
    if (!parcelaFinanceiraId) {
      throw new FinanceiroError("Parcela financeira é obrigatória");
    }
    const formaPagamentoId = props.formaPagamentoId?.trim();
    if (!formaPagamentoId) {
      throw new FinanceiroError("Forma de pagamento é obrigatória");
    }
    if (props.valor <= 0) {
      throw new FinanceiroError("Valor do pagamento deve ser maior que zero");
    }

    return new Pagamento({
      id: randomUUID(),
      negocioId,
      tituloFinanceiroId,
      parcelaFinanceiraId,
      valor: props.valor,
      formaPagamentoId,
      formaPagamentoDescricao: props.formaPagamentoDescricao?.trim() || "",
      dataPagamento: props.dataPagamento ?? new Date(),
      status: "PENDENTE",
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      confirmadoEm: null,
      canceladoEm: null,
      motivoCancelamento: null,
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: PagamentoProps): Pagamento {
    return new Pagamento(props);
  }

  // Confirma o pagamento: PENDENTE → CONFIRMADO. Cancelado não confirma.
  confirmar(): void {
    if (this.props.status === "CANCELADO") {
      throw new FinanceiroError("Pagamento cancelado não pode ser confirmado");
    }
    if (this.props.status === "CONFIRMADO") {
      return;
    }
    this.props.status = "CONFIRMADO";
    this.props.confirmadoEm = new Date();
  }

  // Cancela o pagamento: não compõe mais o valor pago. Exige motivo.
  cancelar(motivo: string): void {
    if (this.props.status === "CANCELADO") {
      throw new FinanceiroError("Pagamento já está cancelado");
    }
    const motivoNorm = motivo?.trim();
    if (!motivoNorm) {
      throw new FinanceiroError("Motivo de cancelamento é obrigatório");
    }
    this.props.status = "CANCELADO";
    this.props.canceladoEm = new Date();
    this.props.motivoCancelamento = motivoNorm;
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): PagamentoProps {
    return { ...this.props };
  }

  // ----- Getters -----

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get tituloFinanceiroId(): string {
    return this.props.tituloFinanceiroId;
  }

  get parcelaFinanceiraId(): string {
    return this.props.parcelaFinanceiraId;
  }

  get valor(): number {
    return this.props.valor;
  }

  get formaPagamentoId(): string {
    return this.props.formaPagamentoId;
  }

  get formaPagamentoDescricao(): string {
    return this.props.formaPagamentoDescricao;
  }

  get dataPagamento(): Date {
    return this.props.dataPagamento;
  }

  get status(): StatusPagamento {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get confirmadoEm(): Date | null | undefined {
    return this.props.confirmadoEm;
  }

  get canceladoEm(): Date | null | undefined {
    return this.props.canceladoEm;
  }

  get motivoCancelamento(): string | null | undefined {
    return this.props.motivoCancelamento;
  }
}
