import { SinalProps } from "./SinalProps";

// Sinal — entrada/adiantamento recebido do cliente.
export class Sinal {
  private constructor(private readonly props: SinalProps) {}

  static criar(props: SinalProps): Sinal {
    return new Sinal(props);
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get clienteId(): string | null | undefined {
    return this.props.clienteId;
  }

  get valor(): number {
    return this.props.valor;
  }

  get status(): SinalProps["status"] {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
