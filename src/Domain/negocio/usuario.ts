import { randomUUID } from "crypto";
import { NegocioError } from "./NegocioError";
import { UsuarioProps, CriarUsuarioProps } from "./UsuarioProps";

// Usuario do sistema — pertence a um Negocio (tenant).
// Sem autenticação/permissões nesta etapa (primeira versão monousuário).
export class Usuario {
  private constructor(private readonly props: UsuarioProps) {}

  static criar(props: CriarUsuarioProps): Usuario {
    const nome = props.nome?.trim();
    const email = props.email?.trim();
    if (!nome) {
      throw new NegocioError("Nome do usuário é obrigatório");
    }
    if (!email) {
      throw new NegocioError("Email do usuário é obrigatório");
    }

    return new Usuario({
      id: randomUUID(),
      negocioId: props.negocioId,
      nome,
      email,
      // Sem autenticação nesta etapa — campo mantido para evolução futura.
      senhaHash: "",
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new NegocioError("Nome do usuário é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarEmail(email: string): void {
    const emailNormalizado = email.trim();
    if (!emailNormalizado) {
      throw new NegocioError("Email do usuário é obrigatório");
    }
    this.props.email = emailNormalizado;
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

  get negocioId(): string {
    return this.props.negocioId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }

  get senhaHash(): string {
    return this.props.senhaHash;
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
