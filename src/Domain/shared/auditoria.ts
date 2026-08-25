import { AuditoriaProps } from "./AuditoriaProps";

// Auditoria genérica — trilha de criação/alteração por entidade.
export class Auditoria {
  private constructor(private readonly props: AuditoriaProps) {}

  static criar(props: AuditoriaProps): Auditoria {
    return new Auditoria(props);
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get entidade(): string {
    return this.props.entidade;
  }

  get entidadeId(): string | null | undefined {
    return this.props.entidadeId;
  }

  get acao(): string {
    return this.props.acao;
  }

  get usuarioId(): string | null | undefined {
    return this.props.usuarioId;
  }

  get dados(): Record<string, unknown> | null | undefined {
    return this.props.dados;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
