import { ParcelaProps } from "./ParcelaProps";

// Parcela de um título — pertence a Titulo via tituloId.
// Pagamento pode baixar a parcela por parcelaId.
export class Parcela {
  private constructor(private readonly props: ParcelaProps) {}

  static criar(props: ParcelaProps): Parcela {
    return new Parcela(props);
  }

  get id(): string {
    return this.props.id;
  }

  get tituloId(): string {
    return this.props.tituloId;
  }

  get numero(): number {
    return this.props.numero;
  }

  get valor(): number {
    return this.props.valor;
  }

  get status(): ParcelaProps["status"] {
    return this.props.status;
  }

  get dataVencimento(): Date | null | undefined {
    return this.props.dataVencimento;
  }

  get dataPagamento(): Date | null | undefined {
    return this.props.dataPagamento;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
