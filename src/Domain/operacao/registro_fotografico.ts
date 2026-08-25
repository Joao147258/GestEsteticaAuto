import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import {
  RegistroFotograficoProps,
  CriarRegistroFotograficoProps,
} from "./RegistroFotograficoProps";

// RegistroFotografico — foto vinculada à ordem de serviço.
// `url` é apenas referência/caminho (sem upload real nesta etapa).
export class RegistroFotografico {
  private constructor(private readonly props: RegistroFotograficoProps) {}

  static criar(props: CriarRegistroFotograficoProps): RegistroFotografico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const ordemServicoId = props.ordemServicoId?.trim();
    if (!ordemServicoId) {
      throw new OperacaoError("Ordem de serviço é obrigatória");
    }
    const veiculoId = props.veiculoId?.trim();
    if (!veiculoId) {
      throw new OperacaoError("Veículo é obrigatório");
    }
    if (!props.tipo) {
      throw new OperacaoError("Tipo da foto é obrigatório");
    }
    const url = props.url?.trim();
    if (!url) {
      throw new OperacaoError("URL da foto é obrigatória");
    }

    return new RegistroFotografico({
      id: randomUUID(),
      negocioId,
      ordemServicoId,
      veiculoId,
      tipo: props.tipo,
      url,
      anexoId: props.anexoId?.trim() || null,
      descricao: props.descricao?.trim() || null,
      responsavelId: props.responsavelId?.trim() || null,
      registradoEm: props.registradoEm ?? new Date(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): RegistroFotograficoProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get ordemServicoId(): string {
    return this.props.ordemServicoId;
  }

  get veiculoId(): string {
    return this.props.veiculoId;
  }

  get tipo(): RegistroFotograficoProps["tipo"] {
    return this.props.tipo;
  }

  get url(): string {
    return this.props.url;
  }

  get anexoId(): string | null | undefined {
    return this.props.anexoId;
  }

  get descricao(): string | null | undefined {
    return this.props.descricao;
  }

  get responsavelId(): string | null | undefined {
    return this.props.responsavelId;
  }

  get registradoEm(): Date {
    return this.props.registradoEm;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
