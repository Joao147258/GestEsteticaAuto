import { randomUUID } from "crypto";
import { FinanceiroError } from "./FinanceiroError";
import {
  CriarFormaPagamentoProps,
  FormaPagamentoProps,
  StatusFormaPagamento,
  TipoFormaPagamento,
} from "./FormaPagamentoProps";

// FormaPagamento — meios de pagamento aceitos pelo negócio (PIX, cartão, etc).
// Não conhece gateway, banco ou serviço externo: apenas a configuração.
export class FormaPagamento {
  private constructor(private readonly props: FormaPagamentoProps) {}

  // Obrigatório: negocioId e nome. Nasce ATIVA. exigeConfirmacaoManual
  // indica se o pagamento nessa forma precisa de confirmação manual antes
  // de compor o valor pago (default: false).
  static criar(props: CriarFormaPagamentoProps): FormaPagamento {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new FinanceiroError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new FinanceiroError("Nome da forma de pagamento é obrigatório");
    }

    return new FormaPagamento({
      id: randomUUID(),
      negocioId,
      nome,
      tipo: props.tipo ?? null,
      status: "ATIVA",
      exigeConfirmacaoManual: props.exigeConfirmacaoManual ?? false,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  static reconstituir(props: FormaPagamentoProps): FormaPagamento {
    return new FormaPagamento(props);
  }

  // Reativa uma forma de pagamento (INATIVA → ATIVA).
  ativar(): void {
    if (this.props.status === "ATIVA") {
      return;
    }
    this.props.status = "ATIVA";
    this.props.atualizadoEm = new Date();
  }

  // Inativa uma forma de pagamento (ATIVA → INATIVA).
  // Forma inativa não deve ser usada em novos pagamentos.
  inativar(): void {
    if (this.props.status === "INATIVA") {
      return;
    }
    this.props.status = "INATIVA";
    this.props.atualizadoEm = new Date();
  }

  // Configura se a forma exige confirmação manual do pagamento.
  alterarExigeConfirmacaoManual(valor: boolean): void {
    this.props.exigeConfirmacaoManual = valor;
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): FormaPagamentoProps {
    return { ...this.props };
  }

  // ----- Getters -----

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get tipo(): TipoFormaPagamento | null | undefined {
    return this.props.tipo;
  }

  get status(): StatusFormaPagamento {
    return this.props.status;
  }

  get exigeConfirmacaoManual(): boolean {
    return this.props.exigeConfirmacaoManual ?? false;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date | undefined {
    return this.props.atualizadoEm;
  }
}
