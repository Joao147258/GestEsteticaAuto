import { TituloProps } from "./TituloProps";

// Título financeiro — representa um valor a receber.
// Nasce de um orçamento aceito (orcamentoId) ou ordem de serviço (ordemServicoId);
// sem conciliação financeira e sem cálculo avançado nesta etapa.
export class Titulo {
  private constructor(private readonly props: TituloProps) {}

  static criar(props: TituloProps): Titulo {
    return new Titulo(props);
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get orcamentoId(): string | null | undefined {
    return this.props.orcamentoId;
  }

  get ordemServicoId(): string | null | undefined {
    return this.props.ordemServicoId;
  }

  get descricao(): string | null | undefined {
    return this.props.descricao;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get status(): TituloProps["status"] {
    return this.props.status;
  }

  get dataEmissao(): Date {
    return this.props.dataEmissao;
  }

  get dataVencimento(): Date | null | undefined {
    return this.props.dataVencimento;
  }

  get parcelas(): TituloProps["parcelas"] {
    return this.props.parcelas;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
