import { randomUUID } from "crypto";
import { CatalogoError } from "./CatalogoError";
import {
  ConsumoInsumoServicoProps,
  CriarConsumoInsumoServicoProps,
} from "./ConsumoInsumoServicoProps";

// ConsumoInsumoServico — referência operacional de quanto de um insumo um
// serviço consome por execução (ex.: Lavagem detalhada → 50 ML de shampoo).
// Não valida tipoUso do produto aqui: essa regra depende do catálogo e é
// orquestrada na camada de aplicação. A entidade não acessa repository.
export class ConsumoInsumoServico {
  private constructor(private readonly props: ConsumoInsumoServicoProps) {}

  // Obrigatórios: negocioId, servicoId, produtoId, unidadeMedida; quantidade
  // deve ser maior que zero (consumo zero não faz sentido operacional).
  static criar(props: CriarConsumoInsumoServicoProps): ConsumoInsumoServico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new CatalogoError("Negócio é obrigatório");
    }
    const servicoId = props.servicoId?.trim();
    if (!servicoId) {
      throw new CatalogoError("Serviço é obrigatório");
    }
    const produtoId = props.produtoId?.trim();
    if (!produtoId) {
      throw new CatalogoError("Produto é obrigatório");
    }
    if (!(props.quantidade > 0)) {
      throw new CatalogoError("Quantidade deve ser maior que zero");
    }
    if (!props.unidadeMedida) {
      throw new CatalogoError("Unidade de medida é obrigatória");
    }

    const agora = new Date();

    return new ConsumoInsumoServico({
      id: randomUUID(),
      negocioId,
      servicoId,
      produtoId,
      quantidade: props.quantidade,
      unidadeMedida: props.unidadeMedida,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  // --- Getters ---

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get servicoId(): string {
    return this.props.servicoId;
  }

  get produtoId(): string {
    return this.props.produtoId;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get unidadeMedida(): ConsumoInsumoServicoProps["unidadeMedida"] {
    return this.props.unidadeMedida;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
