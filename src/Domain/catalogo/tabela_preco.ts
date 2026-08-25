import { randomUUID } from "crypto";
import { CatalogoError } from "./CatalogoError";
import {
  TabelaPrecoProps,
  CriarTabelaPrecoProps,
  ItemTabelaPrecoProps,
  TipoReferenciaTabelaPreco,
} from "./TabelaPrecoProps";

// Tabela de preços — conjunto de preços alternativos por contexto.
// Guarda ITENS (referência + tipo + valor), não entidades completas.
export class TabelaPreco {
  private constructor(private readonly props: TabelaPrecoProps) {}

  // Obrigatórios: negocioId e nome. Decisões: nasce ATIVA com itens vazios;
  // vigência é opcional (tabela sem prazo = vale enquanto ativa).
  static criar(props: CriarTabelaPrecoProps): TabelaPreco {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new CatalogoError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new CatalogoError("Nome da tabela de preços é obrigatório");
    }

    const agora = new Date();

    return new TabelaPreco({
      id: randomUUID(),
      negocioId,
      nome,
      descricao: props.descricao?.trim() || null,
      ativa: true,
      itens: [],
      vigenciaInicio: props.vigenciaInicio ?? null,
      vigenciaFim: props.vigenciaFim ?? null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  // Adiciona um item (referência do catálogo + valor).
  // Decisões: referência e tipo obrigatórios; valor não negativo — o item é
  // um preço alternativo para um serviço/produto/pacote, não a entidade.
  adicionarItem(dados: {
    referenciaId: string;
    tipoReferencia: TipoReferenciaTabelaPreco;
    valor: number;
    observacoes?: string | null;
  }): string {
    const referenciaId = dados.referenciaId?.trim();
    if (!referenciaId) {
      throw new CatalogoError("Referência do item é obrigatória");
    }
    if (!dados.tipoReferencia) {
      throw new CatalogoError("Tipo de referência do item é obrigatório");
    }
    if (dados.valor < 0) {
      throw new CatalogoError("Valor do item não pode ser negativo");
    }

    const agora = new Date();
    const item: ItemTabelaPrecoProps = {
      id: randomUUID(),
      referenciaId,
      tipoReferencia: dados.tipoReferencia,
      valor: dados.valor,
      observacoes: dados.observacoes?.trim() || null,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.props.itens.push(item);
    this.props.atualizadoEm = new Date();
    return item.id;
  }

  removerItem(itemId: string): void {
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new CatalogoError("Item da tabela não encontrado");
    }
    this.props.itens.splice(index, 1);
    this.props.atualizadoEm = new Date();
  }

  alterarNome(nome: string): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new CatalogoError("Nome da tabela de preços é obrigatório");
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

  get itens(): ItemTabelaPrecoProps[] {
    return this.props.itens.map((item) => ({ ...item }));
  }

  get vigenciaInicio(): Date | null | undefined {
    return this.props.vigenciaInicio;
  }

  get vigenciaFim(): Date | null | undefined {
    return this.props.vigenciaFim;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
