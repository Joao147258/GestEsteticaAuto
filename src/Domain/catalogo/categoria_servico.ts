import { randomUUID } from "crypto";
import { CatalogoError } from "./CatalogoError";
import {
  CategoriaServicoProps,
  CriarCategoriaServicoProps,
} from "./CategoriaServicoProps";

// Categoria que agrupa serviços (apenas organização do catálogo).
export class CategoriaServico {
  private constructor(private readonly props: CategoriaServicoProps) {}

  // Obrigatórios: negocioId e nome — categoria sem identificação não faz
  // sentido no catálogo; categoria é apenas organização, sem regras próprias.
  static criar(props: CriarCategoriaServicoProps): CategoriaServico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new CatalogoError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new CatalogoError("Nome da categoria de serviço é obrigatório");
    }

    const agora = new Date();

    return new CategoriaServico({
      id: randomUUID(),
      negocioId,
      nome,
      descricao: props.descricao?.trim() || null,
      ativa: true,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new CatalogoError("Nome da categoria de serviço é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarDescricao(descricao: string | null): void {
    this.props.descricao = descricao?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  ativar(): void {
    if (!this.props.ativa) {
      this.props.ativa = true;
      this.props.atualizadoEm = new Date();
    }
  }

  inativar(): void {
    if (this.props.ativa) {
      this.props.ativa = false;
      this.props.atualizadoEm = new Date();
    }
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

  get descricao(): string | null | undefined {
    return this.props.descricao;
  }

  get ativa(): boolean {
    return this.props.ativa;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
