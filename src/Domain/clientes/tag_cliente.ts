import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import { TagClienteProps, CriarTagClienteProps } from "./TagClienteProps";

// Tag de segmentação de clientes (entidade raiz N:M com Cliente).
// Escopada pelo negócio (negocioId); o Cliente guarda a associação na lista
// tags[] — a tag em si não depende do cliente.
export class TagCliente {
  private constructor(private readonly props: TagClienteProps) {}

  // Obrigatórios: negocioId e nome; `ativo` padrão true — tag nasce utilizável,
  // inativar serve para descontinuar sem apagar o histórico.
  static criar(props: CriarTagClienteProps): TagCliente {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new ClienteError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new ClienteError("Nome da tag é obrigatório");
    }

    const agora = new Date();

    return new TagCliente({
      id: randomUUID(),
      negocioId,
      nome,
      cor: props.cor?.trim() || null,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new ClienteError("Nome da tag é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarCor(cor: string | null): void {
    this.props.cor = cor?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  ativar(): void {
    if (!this.props.ativo) {
      this.props.ativo = true;
      this.props.atualizadoEm = new Date();
    }
  }

  inativar(): void {
    if (this.props.ativo) {
      this.props.ativo = false;
      this.props.atualizadoEm = new Date();
    }
  }

  // Projeção da entidade de volta para dados puros (composição por Props).
  toProps(): TagClienteProps {
    return { ...this.props };
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

  get cor(): string | null | undefined {
    return this.props.cor;
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
