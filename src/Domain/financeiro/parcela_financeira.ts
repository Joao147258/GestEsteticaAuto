import { randomUUID } from "crypto";
import { FinanceiroError } from "./FinanceiroError";
import { Pagamento } from "./pagamento";
import {
  PagamentoProps,
  CriarPagamentoProps,
} from "./PagamentoProps";
import {
  ParcelaFinanceiraProps,
  CriarParcelaFinanceiraProps,
} from "./ParcelaFinanceiraProps";
import {
  StatusParcelaFinanceira,
  TipoParcelaFinanceira,
} from "./financeiro_types";

// ParcelaFinanceira — uma parte de um TituloFinanceiro.
// Pode ser um SINAL (entrada/adiantamento) ou uma PARCELA comum.
// É o nível onde o pagamento é registrado; o título apenas agrega.
export class ParcelaFinanceira {
  private constructor(private readonly props: ParcelaFinanceiraProps) {}

  // Obrigatórios: tituloFinanceiroId (injetado pelo agregado), tipo, número,
  // valor e vencimento. Nasce como PENDENTE, com valorPago zero e saldo
  // aberto igual ao valor original.
  static criar(props: CriarParcelaFinanceiraProps): ParcelaFinanceira {
    const tituloFinanceiroId = props.tituloFinanceiroId?.trim();
    if (!tituloFinanceiroId) {
      throw new FinanceiroError("Título financeiro é obrigatório");
    }
    if (props.tipo !== "SINAL" && props.tipo !== "PARCELA") {
      throw new FinanceiroError("Tipo de parcela inválido");
    }
    if (props.numero <= 0) {
      throw new FinanceiroError("Número da parcela deve ser maior que zero");
    }
    if (props.valorOriginal <= 0) {
      throw new FinanceiroError("Valor da parcela deve ser maior que zero");
    }
    if (!props.dataVencimento) {
      throw new FinanceiroError("Data de vencimento é obrigatória");
    }

    return new ParcelaFinanceira({
      id: randomUUID(),
      tituloFinanceiroId,
      numero: props.numero,
      tipo: props.tipo,
      descricao: props.descricao?.trim() || null,
      valorOriginal: props.valorOriginal,
      valorPago: 0,
      saldoAberto: props.valorOriginal,
      dataVencimento: props.dataVencimento,
      dataPagamento: null,
      status: "PENDENTE",
      pagamentos: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: ParcelaFinanceiraProps): ParcelaFinanceira {
    return new ParcelaFinanceira(props);
  }

  // ----- Pagamentos -----

  // Registra um pagamento novo na parcela. O pagamento nasce PENDENTE e
  // somente ao ser confirmado passa a compor o valor pago. Validações:
  // parcela não cancelada, valor maior que zero e não acima do saldo.
  // negocioId é injetado pelo agregado (a parcela não guarda negocioId).
  registrarPagamento(
    negocioId: string,
    dados: Omit<CriarPagamentoProps, "negocioId" | "tituloFinanceiroId" | "parcelaFinanceiraId">,
  ): string {
    if (this.props.status === "CANCELADA") {
      throw new FinanceiroError("Parcela cancelada não pode receber pagamento");
    }
    if (dados.valor <= 0) {
      throw new FinanceiroError("Valor do pagamento deve ser maior que zero");
    }
    if (dados.valor > this.props.saldoAberto) {
      throw new FinanceiroError("Pagamento não pode ser maior que o saldo em aberto");
    }
    const pagamento = Pagamento.criar({
      ...dados,
      negocioId,
      tituloFinanceiroId: this.props.tituloFinanceiroId,
      parcelaFinanceiraId: this.props.id,
    });
    this.props.pagamentos.push(pagamento.toProps());
    this.props.atualizadoEm = new Date();
    return pagamento.id;
  }

  // Confirma um pagamento PENDENTE: passa a compor valorPago e recalcula
  // status e saldo. Pagamento cancelado não pode ser confirmado.
  confirmarPagamento(pagamentoId: string): void {
    const pagamento = this.encontrarPagamento(pagamentoId);
    if (pagamento.status === "CANCELADO") {
      throw new FinanceiroError("Pagamento cancelado não pode ser confirmado");
    }
    if (pagamento.status === "CONFIRMADO") {
      return;
    }
    pagamento.confirmar();
    this.recalcular();
  }

  // Cancela um pagamento: deixa de compor valorPago e recalcula status e
  // saldo. Reversão do saldo fica no nível do agregado (parcela/título).
  cancelarPagamento(pagamentoId: string, motivo: string): void {
    const pagamento = this.encontrarPagamento(pagamentoId);
    pagamento.cancelar(motivo);
    this.recalcular();
  }

  // ----- Vencimento -----

  // Marca a parcela como VENCIDA quando a data atual ultrapassa o vencimento
  // e ainda há saldo em aberto. Depende apenas de data — sem cron/infra.
  verificarVencimento(dataAtual: Date): void {
    if (
      (this.props.status === "PENDENTE" || this.props.status === "PARCIALMENTE_PAGA") &&
      this.props.saldoAberto > 0 &&
      this.props.dataVencimento < dataAtual
    ) {
      this.props.status = "VENCIDA";
      this.props.atualizadoEm = new Date();
    }
  }

  // ----- Cancelamento -----

  // Cancela a parcela. Regras: paga ou já cancelada não pode ser cancelada.
  cancelar(): void {
    if (this.props.status === "CANCELADA") {
      throw new FinanceiroError("Parcela já está cancelada");
    }
    if (this.props.status === "PAGA") {
      throw new FinanceiroError("Parcela paga não pode ser cancelada");
    }
    this.props.status = "CANCELADA";
    this.props.atualizadoEm = new Date();
  }

  // ----- Helpers privados -----

  private encontrarPagamento(pagamentoId: string): Pagamento {
    const props = this.props.pagamentos.find((p) => p.id === pagamentoId);
    if (!props) {
      throw new FinanceiroError("Pagamento não encontrado");
    }
    return Pagamento.reconstituir(props);
  }

  // Recalcula valorPago (soma dos pagamentos CONFIRMADOS), saldo aberto e
  // status da parcela. Pagamentos PENDENTES e CANCELADOS não compõem.
  private recalcular(): void {
    this.props.valorPago = this.props.pagamentos
      .filter((p) => p.status === "CONFIRMADO")
      .reduce((soma, p) => soma + p.valor, 0);
    this.props.saldoAberto = this.props.valorOriginal - this.props.valorPago;

    if (this.props.saldoAberto <= 0) {
      this.props.status = "PAGA";
      this.props.dataPagamento = new Date();
    } else if (this.props.valorPago > 0) {
      this.props.status = "PARCIALMENTE_PAGA";
    } else {
      this.props.status = "PENDENTE";
    }
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ParcelaFinanceiraProps {
    return { ...this.props, pagamentos: this.props.pagamentos.map((p) => ({ ...p })) };
  }

  // ----- Getters -----

  get id(): string {
    return this.props.id;
  }

  get tituloFinanceiroId(): string {
    return this.props.tituloFinanceiroId;
  }

  get numero(): number {
    return this.props.numero;
  }

  get tipo(): TipoParcelaFinanceira {
    return this.props.tipo;
  }

  get descricao(): string | null | undefined {
    return this.props.descricao;
  }

  get valorOriginal(): number {
    return this.props.valorOriginal;
  }

  get valorPago(): number {
    return this.props.valorPago;
  }

  get saldoAberto(): number {
    return this.props.saldoAberto;
  }

  get dataVencimento(): Date {
    return this.props.dataVencimento;
  }

  get dataPagamento(): Date | null | undefined {
    return this.props.dataPagamento;
  }

  get status(): StatusParcelaFinanceira {
    return this.props.status;
  }

  get pagamentos(): PagamentoProps[] {
    return this.props.pagamentos.map((p) => ({ ...p }));
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
