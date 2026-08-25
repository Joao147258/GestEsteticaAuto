import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import {
  InspecaoEntradaProps,
  CriarInspecaoEntradaProps,
} from "./InspecaoEntradaProps";

// InspecaoEntrada — estado geral do veículo ao chegar.
// SEPARADA do checklist: aqui é o estado (quilometragem, avarias, itens pessoais).
export class InspecaoEntrada {
  private constructor(private readonly props: InspecaoEntradaProps) {}

  static criar(props: CriarInspecaoEntradaProps): InspecaoEntrada {
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
    if (props.quilometragem != null && props.quilometragem < 0) {
      throw new OperacaoError("Quilometragem não pode ser negativa");
    }

    return new InspecaoEntrada({
      id: randomUUID(),
      negocioId,
      ordemServicoId,
      veiculoId,
      quilometragem: props.quilometragem ?? null,
      nivelCombustivel: props.nivelCombustivel?.trim() || null,
      avarias: (props.avarias ?? []).map((item) => item.trim()).filter(Boolean),
      itensPessoais: (props.itensPessoais ?? [])
        .map((item) => item.trim())
        .filter(Boolean),
      observacoesGerais: props.observacoesGerais?.trim() || null,
      responsavelId: props.responsavelId?.trim() || null,
      inspecionadoEm: props.inspecionadoEm ?? new Date(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): InspecaoEntradaProps {
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

  get quilometragem(): number | null | undefined {
    return this.props.quilometragem;
  }

  get nivelCombustivel(): string | null | undefined {
    return this.props.nivelCombustivel;
  }

  get avarias(): string[] | undefined {
    return this.props.avarias ? [...this.props.avarias] : undefined;
  }

  get itensPessoais(): string[] | undefined {
    return this.props.itensPessoais ? [...this.props.itensPessoais] : undefined;
  }

  get observacoesGerais(): string | null | undefined {
    return this.props.observacoesGerais;
  }

  get responsavelId(): string | null | undefined {
    return this.props.responsavelId;
  }

  get inspecionadoEm(): Date {
    return this.props.inspecionadoEm;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
