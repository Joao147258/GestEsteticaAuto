import { randomUUID } from "crypto";
import { FinanceiroError } from "./FinanceiroError";
import {
  CriarTituloFinanceiroProps,
  RegistrarPagamentoProps,
  TituloFinanceiroProps,
} from "./TituloFinanceiroProps";
import { ParcelaFinanceira } from "./parcela_financeira";
import {
  CriarParcelaFinanceiraProps,
  ParcelaFinanceiraProps,
} from "./ParcelaFinanceiraProps";
import {
  OrigemTituloFinanceiro,
  RegistroAlteracaoFinanceiro,
  StatusTituloFinanceiro,
  TipoAlteracaoFinanceira,
} from "./financeiro_types";

// TituloFinanceiro — agregado principal do módulo financeiro.
// Representa uma obrigação financeira (a receber ou a pagar) originada de
// orçamento, ordem de serviço, venda avulsa ou ajuste manual.
// É composto por uma ou mais ParcelaFinanceira; o sinal é uma parcela SINAL.
export class TituloFinanceiro {
  private constructor(private readonly props: TituloFinanceiroProps) {}

  // Obrigatórios: negocioId, origem, descricao, valorOriginal > 0 e ao menos
  // uma parcela. A soma das parcelas deve bater com o valor total do título
  // (valorOriginal - desconto + acréscimo). Nasce como ABERTO.
  static criar(props: CriarTituloFinanceiroProps): TituloFinanceiro {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new FinanceiroError("Negócio é obrigatório");
    }
    if (!props.origem) {
      throw new FinanceiroError("Origem do título é obrigatória");
    }
    const descricao = props.descricao?.trim();
    if (!descricao) {
      throw new FinanceiroError("Descrição do título é obrigatória");
    }
    if (props.valorOriginal <= 0) {
      throw new FinanceiroError("Valor do título deve ser maior que zero");
    }
    if (!props.parcelas || props.parcelas.length === 0) {
      throw new FinanceiroError("Título deve ter ao menos uma parcela");
    }
    const parcelasSinal = props.parcelas.filter((p) => p.tipo === "SINAL");
    if (parcelasSinal.length > 1) {
      throw new FinanceiroError("Título não pode ter mais de uma parcela do tipo SINAL");
    }

    const valorDesconto = props.valorDesconto ?? 0;
    const valorAcrescimo = props.valorAcrescimo ?? 0;
    const valorTotal = props.valorOriginal - valorDesconto + valorAcrescimo;

    const id = randomUUID();
    const agora = new Date();
    const parcelas = props.parcelas.map((p, index) => {
      const parcela = ParcelaFinanceira.criar({
        ...(p as CriarParcelaFinanceiraProps),
        tituloFinanceiroId: id,
        numero: p.numero ?? index + 1,
      });
      return parcela.toProps();
    });

    const somaParcelas = parcelas.reduce((soma, p) => soma + p.valorOriginal, 0);
    if (Math.abs(somaParcelas - valorTotal) > 0.0001) {
      throw new FinanceiroError("Soma das parcelas deve ser igual ao valor total do título");
    }

    const titulo = new TituloFinanceiro({
      id,
      negocioId,
      origem: props.origem,
      origemId: props.origemId?.trim() || null,
      clienteId: props.clienteId?.trim() || null,
      fornecedorId: props.fornecedorId?.trim() || null,
      descricao,
      valorOriginal: props.valorOriginal,
      valorDesconto,
      valorAcrescimo,
      valorTotal,
      status: "ABERTO",
      dataEmissao: props.dataEmissao ?? agora,
      dataVencimento: props.dataVencimento ?? null,
      parcelas,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
      canceladoEm: null,
      motivoCancelamento: null,
      historico: [
        {
          data: agora,
          autorId: null,
          descricao: `Título criado: ${descricao}`,
          tipo: "CRIACAO",
        },
      ],
    });
    titulo.recalcularStatus();
    return titulo;
  }

  // Reconstitui o agregado a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: TituloFinanceiroProps): TituloFinanceiro {
    return new TituloFinanceiro(props);
  }

  // ----- Pagamentos -----

  // Registra um pagamento em uma parcela específica do título. Delega à
  // parcela a validação de saldo; o pagamento nasce PENDENTE.
  registrarPagamento(dados: RegistrarPagamentoProps): string {
    this.validarNaoCancelado();
    const parcela = this.encontrarParcela(dados.parcelaFinanceiraId);
    const pagamentoId = parcela.registrarPagamento(this.props.negocioId, dados);
    this.atualizarParcela(parcela);
    this.registrarAlteracao(
      "PAGAMENTO_REGISTRADO",
      `Pagamento de ${dados.valor} registrado na parcela ${parcela.numero}`,
      dados.autorId,
    );
    this.recalcularStatus();
    return pagamentoId;
  }

  // Confirma um pagamento PENDENTE. Após confirmar, recalcula a parcela e o
  // status do título.
  confirmarPagamento(pagamentoId: string, autorId?: string | null): void {
    this.validarNaoCancelado();
    const { parcela } = this.localizarPagamento(pagamentoId);
    parcela.confirmarPagamento(pagamentoId);
    this.atualizarParcela(parcela);
    this.registrarAlteracao(
      "PAGAMENTO_REGISTRADO",
      `Pagamento confirmado na parcela ${parcela.numero}`,
      autorId,
    );
    this.recalcularStatus();
  }

  // Cancela um pagamento, revertendo o saldo da parcela. Exige motivo.
  cancelarPagamento(pagamentoId: string, motivo: string, autorId?: string | null): void {
    const { parcela } = this.localizarPagamento(pagamentoId);
    parcela.cancelarPagamento(pagamentoId, motivo);
    this.atualizarParcela(parcela);
    this.registrarAlteracao(
      "PAGAMENTO_CANCELADO",
      `Pagamento cancelado na parcela ${parcela.numero}. Motivo: ${motivo}`,
      autorId,
    );
    this.recalcularStatus();
  }

  // ----- Ciclo de vida -----

  // Cancela o título. Regras: não pode estar pago nem já cancelado e não
  // pode ter pagamento confirmado (exigiria estorno/regra explícita).
  cancelar(motivo: string, autorId?: string | null): void {
    if (this.props.status === "CANCELADO") {
      throw new FinanceiroError("Título já está cancelado");
    }
    if (this.props.status === "PAGO") {
      throw new FinanceiroError("Título pago não pode ser cancelado");
    }
    const temPagamentoConfirmado = this.props.parcelas.some((p) =>
      p.pagamentos.some((pg) => pg.status === "CONFIRMADO"),
    );
    if (temPagamentoConfirmado) {
      throw new FinanceiroError("Título com pagamento confirmado não pode ser cancelado");
    }
    const motivoNorm = motivo?.trim();
    if (!motivoNorm) {
      throw new FinanceiroError("Motivo de cancelamento é obrigatório");
    }
    this.props.status = "CANCELADO";
    this.props.canceladoEm = new Date();
    this.props.motivoCancelamento = motivoNorm;
    this.registrarAlteracao("CANCELAMENTO", motivoNorm, autorId);
    this.props.atualizadoEm = new Date();
  }

  // Recalcula o status do título com base no saldo e nas parcelas.
  // Regras:
  // - se cancelado, permanece CANCELADO;
  // - se saldo aberto for zero (todas parcelas pagas), vira PAGO;
  // - se houver alguma parcela paga ou parcialmente paga mas ainda existir
  //   saldo, vira PARCIALMENTE_PAGO;
  // - se vencido e sem quitação, vira VENCIDO;
  // - caso contrário, permanece ABERTO.
  recalcularStatus(): void {
    if (this.props.status === "CANCELADO") {
      return;
    }
    const saldoAberto = this.calcularSaldoAberto();
    const todasPagas = this.props.parcelas.every((p) => p.status === "PAGA");
    const algumaPaga = this.props.parcelas.some((p) => p.status === "PAGA");
    const algumaParcial = this.props.parcelas.some((p) => p.status === "PARCIALMENTE_PAGA");
    const vencidaSemQuitacao =
      this.props.parcelas.some((p) => p.status === "VENCIDA") && saldoAberto > 0;

    if (todasPagas) {
      this.props.status = "PAGO";
    } else if (vencidaSemQuitacao) {
      this.props.status = "VENCIDO";
    } else if (algumaPaga || algumaParcial) {
      this.props.status = "PARCIALMENTE_PAGO";
    } else {
      this.props.status = "ABERTO";
    }
    this.props.atualizadoEm = new Date();
  }

  // Identifica parcelas vencidas com base na data atual (sem cron/job) e
  // recalcula o status do título (pode virar VENCIDO).
  verificarVencimento(dataAtual: Date): void {
    if (this.props.status === "CANCELADO") {
      return;
    }
    for (const props of this.props.parcelas) {
      const parcela = ParcelaFinanceira.reconstituir(props);
      parcela.verificarVencimento(dataAtual);
      this.atualizarParcela(parcela);
    }
    this.recalcularStatus();
  }

  // ----- Helpers privados -----

  private validarNaoCancelado(): void {
    if (this.props.status === "CANCELADO") {
      throw new FinanceiroError("Título cancelado não pode receber pagamento");
    }
  }

  private encontrarParcela(parcelaId: string): ParcelaFinanceira {
    const props = this.props.parcelas.find((p) => p.id === parcelaId);
    if (!props) {
      throw new FinanceiroError("Parcela não encontrada");
    }
    return ParcelaFinanceira.reconstituir(props);
  }

  // Localiza em qual parcela o pagamento está vinculado.
  private localizarPagamento(pagamentoId: string): {
    parcela: ParcelaFinanceira;
    pagamento: ParcelaFinanceiraProps["pagamentos"][number];
  } {
    for (const props of this.props.parcelas) {
      const pagamento = props.pagamentos.find((p) => p.id === pagamentoId);
      if (pagamento) {
        return { parcela: ParcelaFinanceira.reconstituir(props), pagamento };
      }
    }
    throw new FinanceiroError("Pagamento não encontrado");
  }

  private atualizarParcela(parcela: ParcelaFinanceira): void {
    const index = this.props.parcelas.findIndex((p) => p.id === parcela.id);
    this.props.parcelas[index] = parcela.toProps();
  }

  private calcularSaldoAberto(): number {
    return this.props.parcelas.reduce((soma, p) => soma + p.saldoAberto, 0);
  }

  private registrarAlteracao(
    tipo: TipoAlteracaoFinanceira,
    descricao: string,
    autorId?: string | null,
  ): void {
    this.props.historico.push({
      data: new Date(),
      autorId: autorId ?? null,
      descricao,
      tipo,
    });
  }

  // ----- Getters -----

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get origem(): OrigemTituloFinanceiro {
    return this.props.origem;
  }

  get origemId(): string | null | undefined {
    return this.props.origemId;
  }

  get clienteId(): string | null | undefined {
    return this.props.clienteId;
  }

  get fornecedorId(): string | null | undefined {
    return this.props.fornecedorId;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get valorOriginal(): number {
    return this.props.valorOriginal;
  }

  get valorDesconto(): number {
    return this.props.valorDesconto;
  }

  get valorAcrescimo(): number {
    return this.props.valorAcrescimo;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get saldoAberto(): number {
    return this.calcularSaldoAberto();
  }

  get status(): StatusTituloFinanceiro {
    return this.props.status;
  }

  get dataEmissao(): Date {
    return this.props.dataEmissao;
  }

  get dataVencimento(): Date | null | undefined {
    return this.props.dataVencimento;
  }

  get parcelas(): ParcelaFinanceiraProps[] {
    return this.props.parcelas.map((p) => ({ ...p, pagamentos: p.pagamentos.map((pg) => ({ ...pg })) }));
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

  get canceladoEm(): Date | null | undefined {
    return this.props.canceladoEm;
  }

  get motivoCancelamento(): string | null | undefined {
    return this.props.motivoCancelamento;
  }

  get historico(): RegistroAlteracaoFinanceiro[] {
    return this.props.historico.map((h) => ({ ...h }));
  }
}
