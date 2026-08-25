import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import { AnexoClienteProps, CriarAnexoClienteProps } from "./AnexoClienteProps";

// Anexo do cliente — metadados de arquivo/documento vinculado ao cliente.
// `url` é opcional: o anexo pode ser referenciado futuramente por `anexoId`.
// Decisão: aceitar url direta OU anexoId compartilhado (shared) evita
// duplicar o arquivo para cada cliente.
export class AnexoCliente {
  private constructor(private readonly props: AnexoClienteProps) {}

  // Obrigatórios: clienteId e nome; url/anexoId opcionais — um anexo pode ser
  // criado como referência futura (ex.: upload ainda não feito).
  static criar(props: CriarAnexoClienteProps): AnexoCliente {
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new ClienteError("Cliente é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new ClienteError("Nome do anexo é obrigatório");
    }

    const agora = new Date();

    return new AnexoCliente({
      id: randomUUID(),
      clienteId,
      nome,
      url: props.url?.trim() || null,
      anexoId: props.anexoId?.trim() || null,
      descricao: props.descricao?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new ClienteError("Nome do anexo é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarUrl(url: string | null): void {
    this.props.url = url?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarAnexoId(anexoId: string | null): void {
    this.props.anexoId = anexoId?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  alterarDescricao(descricao: string | null): void {
    this.props.descricao = descricao?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): AnexoClienteProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get url(): string | null | undefined {
    return this.props.url;
  }

  get anexoId(): string | null | undefined {
    return this.props.anexoId;
  }

  get descricao(): string | null | undefined {
    return this.props.descricao;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
