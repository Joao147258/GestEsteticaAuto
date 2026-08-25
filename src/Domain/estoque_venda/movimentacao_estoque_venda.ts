import { EstoqueVendaError } from "./EstoqueVendaError";
import { MovimentacaoEstoqueVendaProps } from "./MovimentacaoEstoqueVendaProps";

// Movimentação de estoque de venda — histórico de tudo que altera o saldo ou a reserva.
// Quem cria as movimentações normalmente é o EstoqueVenda (métodos de ação).
export class MovimentacaoEstoqueVenda {
  private constructor(private readonly props: MovimentacaoEstoqueVendaProps) {}

  static criar(props: MovimentacaoEstoqueVendaProps): MovimentacaoEstoqueVenda {
    if (props.quantidade <= 0) {
      throw new EstoqueVendaError("Quantidade movimentada deve ser maior que zero");
    }
    if (props.quantidadeAnterior < 0) {
      throw new EstoqueVendaError("Quantidade anterior não pode ser negativa");
    }
    if (props.quantidadeNova < 0) {
      throw new EstoqueVendaError("Quantidade nova não pode ser negativa");
    }
    if (
      props.quantidadeReservadaAnterior != null &&
      props.quantidadeReservadaAnterior < 0
    ) {
      throw new EstoqueVendaError("Quantidade reservada anterior não pode ser negativa");
    }
    if (
      props.quantidadeReservadaNova != null &&
      props.quantidadeReservadaNova < 0
    ) {
      throw new EstoqueVendaError("Quantidade reservada nova não pode ser negativa");
    }
    return new MovimentacaoEstoqueVenda(props);
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): MovimentacaoEstoqueVendaProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get estoqueVendaId(): string {
    return this.props.estoqueVendaId;
  }

  get produtoId(): string {
    return this.props.produtoId;
  }

  get tipo(): MovimentacaoEstoqueVendaProps["tipo"] {
    return this.props.tipo;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get unidadeMedida(): MovimentacaoEstoqueVendaProps["unidadeMedida"] {
    return this.props.unidadeMedida;
  }

  get quantidadeAnterior(): number {
    return this.props.quantidadeAnterior;
  }

  get quantidadeNova(): number {
    return this.props.quantidadeNova;
  }

  get quantidadeReservadaAnterior(): number | null | undefined {
    return this.props.quantidadeReservadaAnterior;
  }

  get quantidadeReservadaNova(): number | null | undefined {
    return this.props.quantidadeReservadaNova;
  }

  get motivo(): string | null | undefined {
    return this.props.motivo;
  }

  get referenciaId(): string | null | undefined {
    return this.props.referenciaId;
  }

  get referenciaTipo(): string | null | undefined {
    return this.props.referenciaTipo;
  }

  get registradoEm(): Date {
    return this.props.registradoEm;
  }
}
