import { EstoqueInterno, MovimentacaoEstoqueInternoProps } from '../../../../Domain';

// EstoqueInternoPresenter — padroniza a saída JSON do saldo e das movimentações de estoque interno.
export class EstoqueInternoPresenter {
  static toHTTP(estoque: EstoqueInterno) {
    return {
      id: estoque.id,
      negocioId: estoque.negocioId,
      produtoId: estoque.produtoId,
      quantidadeAtual: estoque.quantidadeAtual,
      unidadeMedida: estoque.unidadeMedida,
      custoUnitarioAproximado: estoque.custoUnitarioAproximado ?? null,
      estoqueMinimo: estoque.estoqueMinimo ?? null,
      observacoes: estoque.observacoes ?? null,
      criadoEm: estoque.criadoEm,
      atualizadoEm: estoque.atualizadoEm,
    };
  }

  static movimentacaoToHTTP(movimentacao: MovimentacaoEstoqueInternoProps) {
    return {
      id: movimentacao.id,
      negocioId: movimentacao.negocioId,
      estoqueInternoId: movimentacao.estoqueInternoId,
      produtoId: movimentacao.produtoId,
      tipo: movimentacao.tipo,
      quantidade: movimentacao.quantidade,
      unidadeMedida: movimentacao.unidadeMedida,
      quantidadeAnterior: movimentacao.quantidadeAnterior,
      quantidadeNova: movimentacao.quantidadeNova,
      motivo: movimentacao.motivo ?? null,
      observacoes: movimentacao.observacoes ?? null,
      referenciaId: movimentacao.referenciaId ?? null,
      referenciaTipo: movimentacao.referenciaTipo ?? null,
      referenciaItemId: movimentacao.referenciaItemId ?? null,
      registradoEm: movimentacao.registradoEm,
    };
  }

  static movimentacoesToHTTP(movimentacoes: MovimentacaoEstoqueInternoProps[]) {
    return movimentacoes.map((mov) => this.movimentacaoToHTTP(mov));
  }
}
