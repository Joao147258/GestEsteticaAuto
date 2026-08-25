import { randomUUID } from "crypto";
import { EstoqueVendaError } from "./EstoqueVendaError";
import {
  ReservaEstoqueVendaProps,
  CriarReservaEstoqueVendaProps,
} from "./ReservaEstoqueVendaProps";

// Reserva de estoque de venda — produto separado para uma venda futura.
// As transições de status (cancelar/converter) são orquestradas pelo EstoqueVenda.
export class ReservaEstoqueVenda {
  private constructor(private readonly props: ReservaEstoqueVendaProps) {}

  static criar(props: CriarReservaEstoqueVendaProps): ReservaEstoqueVenda {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new EstoqueVendaError("Negócio é obrigatório");
    }
    const estoqueVendaId = props.estoqueVendaId?.trim();
    if (!estoqueVendaId) {
      throw new EstoqueVendaError("Estoque de venda é obrigatório");
    }
    const produtoId = props.produtoId?.trim();
    if (!produtoId) {
      throw new EstoqueVendaError("Produto é obrigatório");
    }
    if (props.quantidade <= 0) {
      throw new EstoqueVendaError("Quantidade deve ser maior que zero");
    }
    if (!props.unidadeMedida) {
      throw new EstoqueVendaError("Unidade de medida é obrigatória");
    }

    return new ReservaEstoqueVenda({
      id: randomUUID(),
      negocioId,
      estoqueVendaId,
      produtoId,
      quantidade: props.quantidade,
      unidadeMedida: props.unidadeMedida,
      status: "ATIVA",
      referenciaId: props.referenciaId?.trim() || null,
      referenciaTipo: props.referenciaTipo?.trim() || null,
      observacoes: props.observacoes?.trim() || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): ReservaEstoqueVendaProps {
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

  get quantidade(): number {
    return this.props.quantidade;
  }

  get unidadeMedida(): ReservaEstoqueVendaProps["unidadeMedida"] {
    return this.props.unidadeMedida;
  }

  get status(): ReservaEstoqueVendaProps["status"] {
    return this.props.status;
  }

  get referenciaId(): string | null | undefined {
    return this.props.referenciaId;
  }

  get referenciaTipo(): string | null | undefined {
    return this.props.referenciaTipo;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
