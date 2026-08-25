import { randomUUID } from "crypto";
import { CatalogoError } from "./CatalogoError";
import {
  PacoteServicoProps,
  CriarPacoteServicoProps,
  ItemPacoteServicoProps,
} from "./PacoteServicoProps";

// Pacote que combina vários serviços em uma oferta.
// O pacote guarda ITENS (referência + quantidade), não a entidade Servico inteira.
export class PacoteServico {
  private constructor(private readonly props: PacoteServicoProps) {}

  // Obrigatórios: negocioId, nome e precoPacote (não negativo). Decisão:
  // itens do pacote começam vazios e são adicionados por referência — o pacote
  // não copia a entidade Servico inteira.
  static criar(props: CriarPacoteServicoProps): PacoteServico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new CatalogoError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new CatalogoError("Nome do pacote é obrigatório");
    }
    if (props.precoPacote < 0) {
      throw new CatalogoError("Preço do pacote não pode ser negativo");
    }

    const agora = new Date();

    return new PacoteServico({
      id: randomUUID(),
      negocioId,
      nome,
      descricao: props.descricao?.trim() || null,
      itens: [],
      precoPacote: props.precoPacote,
      status: "ATIVO",
      observacoes: props.observacoes?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  // Adiciona um serviço ao pacote (referência + quantidade).
  // Decisões: servicoId obrigatório e quantidade > 0 — um item sem serviço ou
  // com quantidade zero não faz sentido no pacote.
  adicionarItem(dados: {
    servicoId: string;
    descricao?: string | null;
    quantidade: number;
  }): string {
    const servicoId = dados.servicoId?.trim();
    if (!servicoId) {
      throw new CatalogoError("Serviço do item do pacote é obrigatório");
    }
    if (dados.quantidade <= 0) {
      throw new CatalogoError("Quantidade do item deve ser maior que zero");
    }

    const agora = new Date();
    const item: ItemPacoteServicoProps = {
      id: randomUUID(),
      servicoId,
      descricao: dados.descricao?.trim() || null,
      quantidade: dados.quantidade,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.props.itens.push(item);
    this.props.atualizadoEm = new Date();
    return item.id;
  }

  // Remove item pelo id; erro se não existir — decisão: falhar em vez de
  // remover silenciosamente nada (chamador descobre o erro de imediato).
  removerItem(itemId: string): void {
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new CatalogoError("Item do pacote não encontrado");
    }
    this.props.itens.splice(index, 1);
    this.props.atualizadoEm = new Date();
  }

  alterarPrecoPacote(precoPacote: number): void {
    if (precoPacote < 0) {
      throw new CatalogoError("Preço do pacote não pode ser negativo");
    }
    this.props.precoPacote = precoPacote;
    this.props.atualizadoEm = new Date();
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new CatalogoError("Nome do pacote é obrigatório");
    }
    this.props.nome = nomeNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarDescricao(descricao: string | null): void {
    this.props.descricao = descricao?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  atualizarObservacoes(observacoes: string | null): void {
    this.props.observacoes = observacoes?.trim() || null;
    this.props.atualizadoEm = new Date();
  }

  ativar(): void {
    if (this.props.status === "ATIVO") {
      return;
    }
    this.props.status = "ATIVO";
    this.props.atualizadoEm = new Date();
  }

  inativar(): void {
    if (this.props.status === "INATIVO") {
      return;
    }
    this.props.status = "INATIVO";
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

  get descricao(): string | null | undefined {
    return this.props.descricao;
  }

  get itens(): ItemPacoteServicoProps[] {
    return this.props.itens.map((item) => ({ ...item }));
  }

  get precoPacote(): number {
    return this.props.precoPacote;
  }

  get status(): PacoteServicoProps["status"] {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
