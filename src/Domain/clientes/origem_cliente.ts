import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import { OrigemClienteProps, CriarOrigemClienteProps } from "./OrigemClienteProps";

// Origem de captação do cliente (ex: Instagram, indicação, Google).
// O Cliente a referencia por origemId — relação leve, sem composição.
export class OrigemCliente {
  private constructor(private readonly props: OrigemClienteProps) {}

  // Obrigatórios: negocioId e nome; `ativo` padrão true — permite reativar
  // origens sem recriar (clientes antigos mantêm o origemId).
  static criar(props: CriarOrigemClienteProps): OrigemCliente {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new ClienteError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new ClienteError("Nome da origem é obrigatório");
    }

    const agora = new Date();

    return new OrigemCliente({
      id: randomUUID(),
      negocioId,
      nome,
      descricao: props.descricao?.trim() || null,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new ClienteError("Nome da origem é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarDescricao(descricao: string | null): void {
    this.props.descricao = descricao?.trim() || null;
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
  toProps(): OrigemClienteProps {
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

  get descricao(): string | null | undefined {
    return this.props.descricao;
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
