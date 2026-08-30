import { randomUUID } from "crypto";
import { EstoqueInternoError } from "./EstoqueInternoError";
import { EstoqueInternoProps, CriarEstoqueInternoProps } from "./EstoqueInternoProps";
import { MovimentacaoEstoqueInterno } from "./movimentacao_estoque_interno";
import { MovimentacaoEstoqueInternoProps } from "./MovimentacaoEstoqueInternoProps";
import { TipoMovimentacaoEstoqueInterno } from "./tipo_movimentacao_estoque_interno_types";

// Estoque interno controla insumos e produtos usados na operação.
// Ajuda a visualizar gastos e consumo, mas não deve impor uma regra rígida
// de precificação. Nenhuma lógica de venda/reserva vive aqui.
export class EstoqueInterno {
  private constructor(private readonly props: EstoqueInternoProps) {}

  // Obrigatórios: negocioId, produtoId e unidadeMedida. Decisões: o saldo
  // inicial entra como movimentação ENTRADA para o histórico ficar completo;
  // custo aproximado e estoque mínimo são opcionais e não negativos.
  static criar(props: CriarEstoqueInternoProps): EstoqueInterno {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new EstoqueInternoError("Negócio é obrigatório");
    }
    const produtoId = props.produtoId?.trim();
    if (!produtoId) {
      throw new EstoqueInternoError("Produto é obrigatório");
    }
    if (!props.unidadeMedida) {
      throw new EstoqueInternoError("Unidade de medida é obrigatória");
    }
    const quantidadeInicial = props.quantidadeInicial ?? 0;
    if (quantidadeInicial < 0) {
      throw new EstoqueInternoError("Quantidade inicial não pode ser negativa");
    }
    if (
      props.custoUnitarioAproximado !== undefined &&
      props.custoUnitarioAproximado !== null &&
      props.custoUnitarioAproximado < 0
    ) {
      throw new EstoqueInternoError("Custo unitário aproximado não pode ser negativo");
    }
    if (
      props.estoqueMinimo !== undefined &&
      props.estoqueMinimo !== null &&
      props.estoqueMinimo < 0
    ) {
      throw new EstoqueInternoError("Estoque mínimo não pode ser negativo");
    }

    const estoque = new EstoqueInterno({
      id: randomUUID(),
      negocioId,
      produtoId,
      quantidadeAtual: quantidadeInicial,
      unidadeMedida: props.unidadeMedida,
      custoUnitarioAproximado: props.custoUnitarioAproximado ?? null,
      estoqueMinimo: props.estoqueMinimo ?? null,
      observacoes: props.observacoes?.trim() || null,
      movimentacoes: [],
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

  // Entrada de produto (compra, reposição, devolução interna).
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

  // Saída para uso interno (consumo na operação, uso em um carro, etc.).
  // Aceita referência opcional da operação que gerou a baixa (ex.: OS e item).
  registrarSaidaInterna(
    quantidade: number,
    motivo?: string | null,
    referenciaId?: string | null,
    referenciaTipo?: string | null,
    referenciaItemId?: string | null,
  ): void {
    this.validarQuantidadePositiva(quantidade);
    this.validarSaldoParaBaixa(quantidade);
    const anterior = this.props.quantidadeAtual;
    const nova = anterior - quantidade;
    this.props.quantidadeAtual = nova;
    this.registrarMovimentacao({
      tipo: "SAIDA_INTERNA",
      quantidade,
      quantidadeAnterior: anterior,
      quantidadeNova: nova,
      motivo,
      referenciaId,
      referenciaTipo,
      referenciaItemId,
    });
  }

  // Perda (avaria, vazamento, quebra, produto vencido).
  registrarPerda(quantidade: number, motivo?: string | null): void {
    this.validarQuantidadePositiva(quantidade);
    this.validarSaldoParaBaixa(quantidade);
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
      throw new EstoqueInternoError("Quantidade não pode ser negativa");
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
      throw new EstoqueInternoError("Quantidade deve ser maior que zero");
    }
  }

  // Regra central do estoque: o saldo nunca fica negativo — qualquer baixa
  // (saída interna, perda) passa por esta validação antes de alterar o saldo.
  private validarSaldoParaBaixa(quantidade: number): void {
    if (quantidade > this.props.quantidadeAtual) {
      throw new EstoqueInternoError("Saldo insuficiente para baixar");
    }
  }

  // Cria a movimentação (com validação própria) e guarda no histórico.
  private registrarMovimentacao(params: {
    tipo: TipoMovimentacaoEstoqueInterno;
    quantidade: number;
    quantidadeAnterior: number;
    quantidadeNova: number;
    motivo?: string | null;
    observacoes?: string | null;
    referenciaId?: string | null;
    referenciaTipo?: string | null;
    referenciaItemId?: string | null;
  }): void {
    const movimentacao = MovimentacaoEstoqueInterno.criar({
      id: randomUUID(),
      negocioId: this.props.negocioId,
      estoqueInternoId: this.props.id,
      produtoId: this.props.produtoId,
      tipo: params.tipo,
      quantidade: params.quantidade,
      unidadeMedida: this.props.unidadeMedida,
      quantidadeAnterior: params.quantidadeAnterior,
      quantidadeNova: params.quantidadeNova,
      motivo: params.motivo?.trim() || null,
      observacoes: params.observacoes?.trim() || null,
      referenciaId: params.referenciaId?.trim() || null,
      referenciaTipo: params.referenciaTipo?.trim() || null,
      referenciaItemId: params.referenciaItemId?.trim() || null,
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

  get unidadeMedida(): EstoqueInternoProps["unidadeMedida"] {
    return this.props.unidadeMedida;
  }

  get custoUnitarioAproximado(): number | null | undefined {
    return this.props.custoUnitarioAproximado;
  }

  get estoqueMinimo(): number | null | undefined {
    return this.props.estoqueMinimo;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get movimentacoes(): MovimentacaoEstoqueInternoProps[] {
    return this.props.movimentacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
