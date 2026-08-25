import { EstoqueInternoError } from "./EstoqueInternoError";
import { MovimentacaoEstoqueInternoProps } from "./MovimentacaoEstoqueInternoProps";

// Movimentação de estoque interno — histórico de tudo que altera o saldo.
// Quem cria as movimentações normalmente é o EstoqueInterno (métodos de ação).
export class MovimentacaoEstoqueInterno {
  private constructor(private readonly props: MovimentacaoEstoqueInternoProps) {}

  // Regras: quantidade movimentada > 0 e saldos anterior/novo não negativos —
  // decisão para o histórico nunca conter movimentação inconsistente.
  static criar(props: MovimentacaoEstoqueInternoProps): MovimentacaoEstoqueInterno {
    if (props.quantidade <= 0) {
      throw new EstoqueInternoError("Quantidade movimentada deve ser maior que zero");
    }
    if (props.quantidadeAnterior < 0) {
      throw new EstoqueInternoError("Quantidade anterior não pode ser negativa");
    }
    if (props.quantidadeNova < 0) {
      throw new EstoqueInternoError("Quantidade nova não pode ser negativa");
    }
    return new MovimentacaoEstoqueInterno(props);
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): MovimentacaoEstoqueInternoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get estoqueInternoId(): string {
    return this.props.estoqueInternoId;
  }

  get produtoId(): string {
    return this.props.produtoId;
  }

  get tipo(): MovimentacaoEstoqueInternoProps["tipo"] {
    return this.props.tipo;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get unidadeMedida(): MovimentacaoEstoqueInternoProps["unidadeMedida"] {
    return this.props.unidadeMedida;
  }

  get quantidadeAnterior(): number {
    return this.props.quantidadeAnterior;
  }

  get quantidadeNova(): number {
    return this.props.quantidadeNova;
  }

  get motivo(): string | null | undefined {
    return this.props.motivo;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get registradoEm(): Date {
    return this.props.registradoEm;
  }
}
