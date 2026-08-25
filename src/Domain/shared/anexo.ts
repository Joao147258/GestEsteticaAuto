import { AnexoProps } from "./AnexoProps";

// Anexo genérico — arquivo referenciado por URL, vinculável a qualquer entidade.
export class Anexo {
  private constructor(private readonly props: AnexoProps) {}

  static criar(props: AnexoProps): Anexo {
    return new Anexo(props);
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

  get tipo(): string | null | undefined {
    return this.props.tipo;
  }

  get mimeType(): string | null | undefined {
    return this.props.mimeType;
  }

  get url(): string {
    return this.props.url;
  }

  get tamanho(): number | null | undefined {
    return this.props.tamanho;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
