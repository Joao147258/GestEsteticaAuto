import { FormaPagamentoProps } from "./FormaPagamentoProps";

// Forma de pagamento aceita pelo negócio (PIX, cartão, etc).
// Pagamentos a referenciam por formaPagamentoId; o comercial usa o type
// FormaPagamentoComercial para as regras de política/condição.
export class FormaPagamento {
  private constructor(private readonly props: FormaPagamentoProps) {}

  static criar(props: FormaPagamentoProps): FormaPagamento {
    return new FormaPagamento(props);
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get tipo(): FormaPagamentoProps["tipo"] {
    return this.props.tipo;
  }

  get status(): FormaPagamentoProps["status"] {
    return this.props.status;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
