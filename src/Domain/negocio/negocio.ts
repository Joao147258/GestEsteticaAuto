import { randomUUID } from "crypto";
import { NegocioError } from "./NegocioError";
import { NegocioProps, CriarNegocioProps } from "./NegocioProps";

// Negocio — tenant do SaaS. Todos os demais domínios são escopados por ele.
export class Negocio {
  private constructor(private readonly props: NegocioProps) {}

  static criar(props: CriarNegocioProps): Negocio {
    const nome = props.nome?.trim();
    if (!nome) {
      throw new NegocioError("Nome do negócio é obrigatório");
    }

    return new Negocio({
      id: randomUUID(),
      nome,
      cnpj: props.cnpj?.trim() || null,
      telefone: props.telefone?.trim() || null,
      email: props.email?.trim() || null,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new NegocioError("Nome do negócio é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarDocumento(cnpj: string | null): void {
    this.props.cnpj = cnpj?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  ativar(): void {
    if (this.props.ativo) {
      return;
    }
    this.props.ativo = true;
    this.props.atualizadoEm = new Date();
  }

  inativar(): void {
    if (!this.props.ativo) {
      return;
    }
    this.props.ativo = false;
    this.props.atualizadoEm = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get cnpj(): string | null | undefined {
    return this.props.cnpj;
  }

  get telefone(): string | null | undefined {
    return this.props.telefone;
  }

  get email(): string | null | undefined {
    return this.props.email;
  }

  get ativo(): boolean {
    return this.props.ativo;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
