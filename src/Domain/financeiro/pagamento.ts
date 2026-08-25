import { PagamentoProps } from "./PagamentoProps";

// Pagamento recebido — referencia forma de pagamento por id.
// Baixa um título (tituloId) e/ou uma parcela (parcelaId).
export class Pagamento {
  private constructor(private readonly props: PagamentoProps) {}

  static criar(props: PagamentoProps): Pagamento {
    return new Pagamento(props);
  }

  get id(): string {
    return this.props.id;
  }

  get tituloId(): string | null | undefined {
    return this.props.tituloId;
  }

  get parcelaId(): string | null | undefined {
    return this.props.parcelaId;
  }

  get formaPagamentoId(): string | null | undefined {
    return this.props.formaPagamentoId;
  }

  get valor(): number {
    return this.props.valor;
  }

  get status(): PagamentoProps["status"] {
    return this.props.status;
  }

  get dataPagamento(): Date {
    return this.props.dataPagamento;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
