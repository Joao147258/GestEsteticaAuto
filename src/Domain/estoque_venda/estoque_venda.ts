import { randomUUID } from "crypto";
import { EstoqueVendaError } from "./EstoqueVendaError";
import { EstoqueVendaProps, CriarEstoqueVendaProps } from "./EstoqueVendaProps";
import { MovimentacaoEstoqueVenda } from "./movimentacao_estoque_venda";
import { MovimentacaoEstoqueVendaProps } from "./MovimentacaoEstoqueVendaProps";
import { ReservaEstoqueVenda } from "./reserva_estoque_venda";
import { ReservaEstoqueVendaProps } from "./ReservaEstoqueVendaProps";
import { TipoMovimentacaoEstoqueVenda } from "./tipo_movimentacao_estoque_venda_types";

// Estoque de venda controla produtos vendidos diretamente ao cliente.
// Separa o que está reservado do que está realmente disponível para venda.
// Nenhuma lógica de estoque interno, serviço ou financeiro vive aqui.
export class EstoqueVenda {
  private constructor(private readonly props: EstoqueVendaProps) {}

  static criar(props: CriarEstoqueVendaProps): EstoqueVenda {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new EstoqueVendaError("Negócio é obrigatório");
    }
    const produtoId = props.produtoId?.trim();
    if (!produtoId) {
      throw new EstoqueVendaError("Produto é obrigatório");
    }
    if (!props.unidadeMedida) {
      throw new EstoqueVendaError("Unidade de medida é obrigatória");
    }
    const quantidadeInicial = props.quantidadeInicial ?? 0;
    if (quantidadeInicial < 0) {
      throw new EstoqueVendaError("Quantidade inicial não pode ser negativa");
    }
    if (props.custoUnitario != null && props.custoUnitario < 0) {
      throw new EstoqueVendaError("Custo unitário não pode ser negativo");
    }
    if (props.precoVenda != null && props.precoVenda < 0) {
      throw new EstoqueVendaError("Preço de venda não pode ser negativo");
    }
    if (props.estoqueMinimo != null && props.estoqueMinimo < 0) {
      throw new EstoqueVendaError("Estoque mínimo não pode ser negativo");
    }

    const estoque = new EstoqueVenda({
      id: randomUUID(),
      negocioId,
      produtoId,
      quantidadeAtual: quantidadeInicial,
      quantidadeReservada: 0,
      unidadeMedida: props.unidadeMedida,
      custoUnitario: props.custoUnitario ?? null,
      precoVenda: props.precoVenda ?? null,
      estoqueMinimo: props.estoqueMinimo ?? null,
      observacoes: props.observacoes?.trim() || null,
      movimentacoes: [],
      reservas: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    // Saldo inicial entra como movimentação para o histórico ficar completo.
    if (quantidadeInicial > 0) {
      estoque.registrarMovimentacao({
        tipo: "ENTRADA",
        quantidade: quantidadeInicial,
        quantidadeAnterior: 0,
        quantidadeNova: quantidadeInicial,
        motivo: "Saldo inicial",
      });
    }

    return estoque;
  }

  // ----- Ações que movimentam o estoque -----

  // Entrada de produto (compra, reposição).
  adicionarEntrada(quantidade: number, motivo?: string | null): void {
    this.validarQuantidadePositiva(quantidade);
    const anterior = this.props.quantidadeAtual;
    const nova = anterior + quantidade;
    this.props.quantidadeAtual = nova;
    this.registrarMovimentacao({
      tipo: "ENTRADA",
      quantidade,
      quantidadeAnterior: anterior,
      quantidadeNova: nova,
      motivo,
    });
  }

  // Reserva produto para uma venda futura — não muda o saldo físico,
  // apenas separa parte do saldo disponível.
  reservarQuantidade(
    quantidade: number,
    referenciaId?: string | null,
    referenciaTipo?: string | null,
    observacoes?: string | null,
  ): void {
    this.validarQuantidadePositiva(quantidade);
    if (quantidade > this.quantidadeDisponivel) {
      throw new EstoqueVendaError("Reserva excede a quantidade disponível");
    }
    const reserva = ReservaEstoqueVenda.criar({
      negocioId: this.props.negocioId,
      estoqueVendaId: this.props.id,
      produtoId: this.props.produtoId,
      quantidade,
      unidadeMedida: this.props.unidadeMedida,
      referenciaId,
      referenciaTipo,
      observacoes,
    });
    const reservadaAnterior = this.props.quantidadeReservada;
    this.props.quantidadeReservada += quantidade;
    this.props.reservas.push(reserva.toProps());
    this.registrarMovimentacao({
      tipo: "RESERVA",
      quantidade,
      quantidadeAnterior: this.props.quantidadeAtual,
      quantidadeNova: this.props.quantidadeAtual,
      quantidadeReservadaAnterior: reservadaAnterior,
      quantidadeReservadaNova: this.props.quantidadeReservada,
      referenciaId,
      referenciaTipo,
    });
  }

  // Cancela uma reserva ativa — devolve o saldo ao disponível.
  cancelarReserva(reservaId: string, motivo?: string | null): void {
    const index = this.props.reservas.findIndex((r) => r.id === reservaId);
    if (index === -1) {
      throw new EstoqueVendaError("Reserva não encontrada");
    }
    const reserva = this.props.reservas[index];
    if (reserva.status !== "ATIVA") {
      throw new EstoqueVendaError("Apenas reserva ATIVA pode ser cancelada");
    }
    const reservadaAnterior = this.props.quantidadeReservada;
    this.props.quantidadeReservada -= reserva.quantidade;
    reserva.status = "CANCELADA";
    reserva.atualizadoEm = new Date();
    this.registrarMovimentacao({
      tipo: "CANCELAMENTO_RESERVA",
      quantidade: reserva.quantidade,
      quantidadeAnterior: this.props.quantidadeAtual,
      quantidadeNova: this.props.quantidadeAtual,
      quantidadeReservadaAnterior: reservadaAnterior,
      quantidadeReservadaNova: this.props.quantidadeReservada,
      motivo,
      referenciaId: reserva.referenciaId,
      referenciaTipo: reserva.referenciaTipo,
    });
  }

  // Venda direta — baixa o saldo físico sem mexer na reserva.
  baixarPorVenda(
    quantidade: number,
    referenciaId?: string | null,
    referenciaTipo?: string | null,
    motivo?: string | null,
  ): void {
    this.validarQuantidadePositiva(quantidade);
    if (quantidade > this.quantidadeDisponivel) {
      throw new EstoqueVendaError("Saldo disponível insuficiente para venda");
    }
    const anterior = this.props.quantidadeAtual;
    const nova = anterior - quantidade;
    this.props.quantidadeAtual = nova;
    this.registrarMovimentacao({
      tipo: "BAIXA_VENDA",
      quantidade,
      quantidadeAnterior: anterior,
      quantidadeNova: nova,
      motivo,
      referenciaId,
      referenciaTipo,
    });
  }

  // Converte uma reserva ativa em venda efetiva — baixa saldo físico e reserva.
  converterReservaEmVenda(reservaId: string, motivo?: string | null): void {
    const index = this.props.reservas.findIndex((r) => r.id === reservaId);
    if (index === -1) {
      throw new EstoqueVendaError("Reserva não encontrada");
    }
    const reserva = this.props.reservas[index];
    if (reserva.status !== "ATIVA") {
      throw new EstoqueVendaError("Apenas reserva ATIVA pode ser convertida em venda");
    }
    if (reserva.quantidade > this.quantidadeDisponivel) {
      throw new EstoqueVendaError("Saldo disponível insuficiente para venda");
    }
    const anterior = this.props.quantidadeAtual;
    const nova = anterior - reserva.quantidade;
    const reservadaAnterior = this.props.quantidadeReservada;
    this.props.quantidadeAtual = nova;
    this.props.quantidadeReservada -= reserva.quantidade;
    reserva.status = "CONVERTIDA_EM_VENDA";
    reserva.atualizadoEm = new Date();
    this.registrarMovimentacao({
      tipo: "BAIXA_VENDA",
      quantidade: reserva.quantidade,
      quantidadeAnterior: anterior,
      quantidadeNova: nova,
      quantidadeReservadaAnterior: reservadaAnterior,
      quantidadeReservadaNova: this.props.quantidadeReservada,
      motivo,
      referenciaId: reserva.referenciaId,
      referenciaTipo: reserva.referenciaTipo,
    });
  }

  // Devolução de produto vendido — devolve ao saldo físico.
  registrarDevolucao(quantidade: number, motivo?: string | null): void {
    this.validarQuantidadePositiva(quantidade);
    const anterior = this.props.quantidadeAtual;
    const nova = anterior + quantidade;
    this.props.quantidadeAtual = nova;
    this.registrarMovimentacao({
      tipo: "DEVOLUCAO",
      quantidade,
      quantidadeAnterior: anterior,
      quantidadeNova: nova,
      motivo,
    });
  }

  // Perda (avaria, vencimento) — baixa o saldo físico.
  registrarPerda(quantidade: number, motivo?: string | null): void {
    this.validarQuantidadePositiva(quantidade);
    if (quantidade > this.quantidadeDisponivel) {
      throw new EstoqueVendaError("Saldo disponível insuficiente para perda");
    }
    const anterior = this.props.quantidadeAtual;
    const nova = anterior - quantidade;
    this.props.quantidadeAtual = nova;
    this.registrarMovimentacao({
      tipo: "PERDA",
      quantidade,
      quantidadeAnterior: anterior,
      quantidadeNova: nova,
      motivo,
    });
  }

  // Ajuste manual de contagem — registra a diferença como AJUSTE.
  ajustarQuantidade(novaQuantidade: number, motivo?: string | null): void {
    if (novaQuantidade < 0) {
      throw new EstoqueVendaError("Quantidade não pode ser negativa");
    }
    if (novaQuantidade < this.props.quantidadeReservada) {
      throw new EstoqueVendaError(
        "Ajuste não pode deixar o saldo menor que a quantidade reservada",
      );
    }
    if (novaQuantidade === this.props.quantidadeAtual) {
      return; // sem mudança real, não registra movimentação
    }
    this.registrarMovimentacao({
      tipo: "AJUSTE",
      quantidade: Math.abs(novaQuantidade - this.props.quantidadeAtual),
      quantidadeAnterior: this.props.quantidadeAtual,
      quantidadeNova: novaQuantidade,
      motivo,
    });
    this.props.quantidadeAtual = novaQuantidade;
  }

  // ----- Helpers privados -----

  private validarQuantidadePositiva(quantidade: number): void {
    if (quantidade <= 0) {
      throw new EstoqueVendaError("Quantidade deve ser maior que zero");
    }
  }

  // Cria a movimentação (com validação própria) e guarda no histórico.
  private registrarMovimentacao(params: {
    tipo: TipoMovimentacaoEstoqueVenda;
    quantidade: number;
    quantidadeAnterior: number;
    quantidadeNova: number;
    quantidadeReservadaAnterior?: number | null;
    quantidadeReservadaNova?: number | null;
    motivo?: string | null;
    referenciaId?: string | null;
    referenciaTipo?: string | null;
  }): void {
    const movimentacao = MovimentacaoEstoqueVenda.criar({
      id: randomUUID(),
      negocioId: this.props.negocioId,
      estoqueVendaId: this.props.id,
      produtoId: this.props.produtoId,
      tipo: params.tipo,
      quantidade: params.quantidade,
      unidadeMedida: this.props.unidadeMedida,
      quantidadeAnterior: params.quantidadeAnterior,
      quantidadeNova: params.quantidadeNova,
      quantidadeReservadaAnterior: params.quantidadeReservadaAnterior ?? null,
      quantidadeReservadaNova: params.quantidadeReservadaNova ?? null,
      motivo: params.motivo?.trim() || null,
      referenciaId: params.referenciaId?.trim() || null,
      referenciaTipo: params.referenciaTipo?.trim() || null,
      registradoEm: new Date(),
    });
    this.props.movimentacoes.push(movimentacao.toProps());
    this.props.atualizadoEm = new Date();
  }

  // ----- Getters -----

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get produtoId(): string {
    return this.props.produtoId;
  }

  get quantidadeAtual(): number {
    return this.props.quantidadeAtual;
  }

  get quantidadeReservada(): number {
    return this.props.quantidadeReservada;
  }

  // Disponível para venda = o que existe menos o que já está reservado.
  get quantidadeDisponivel(): number {
    return this.props.quantidadeAtual - this.props.quantidadeReservada;
  }

  get unidadeMedida(): EstoqueVendaProps["unidadeMedida"] {
    return this.props.unidadeMedida;
  }

  get custoUnitario(): number | null | undefined {
    return this.props.custoUnitario;
  }

  get precoVenda(): number | null | undefined {
    return this.props.precoVenda;
  }

  get estoqueMinimo(): number | null | undefined {
    return this.props.estoqueMinimo;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get movimentacoes(): MovimentacaoEstoqueVendaProps[] {
    return this.props.movimentacoes;
  }

  get reservas(): ReservaEstoqueVendaProps[] {
    return this.props.reservas;
  }

  // Margem unitária aproximada — null quando falta custo ou preço.
  get margemUnitariaAproximada(): number | null {
    if (this.props.custoUnitario == null || this.props.precoVenda == null) {
      return null;
    }
    return this.props.precoVenda - this.props.custoUnitario;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
