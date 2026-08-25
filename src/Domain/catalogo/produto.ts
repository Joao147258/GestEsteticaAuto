import { randomUUID } from "crypto";
import { CatalogoError } from "./CatalogoError";
import { ProdutoProps, CriarProdutoProps } from "./ProdutoProps";
import { TipoUsoProduto } from "./tipo_uso_produto_types";
import { UnidadeMedida } from "./unidade_medida_types";

// Produto do catálogo — item cadastrado (sem quantidade, sem estoque).
// Estoque interno e de venda o referenciam por produtoId; orçamento/OS guardam snapshot.
export class Produto {
  private constructor(private readonly props: ProdutoProps) {}

  static criar(props: CriarProdutoProps): Produto {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new CatalogoError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new CatalogoError("Nome do produto é obrigatório");
    }
    if (!props.tipoUso) {
      throw new CatalogoError("Tipo de uso do produto é obrigatório");
    }
    if (!props.unidadeMedida) {
      throw new CatalogoError("Unidade de medida é obrigatória");
    }
    if (props.custoReferencia != null && props.custoReferencia < 0) {
      throw new CatalogoError("Custo de referência não pode ser negativo");
    }
    if (props.precoVendaSugerido != null && props.precoVendaSugerido < 0) {
      throw new CatalogoError("Preço de venda sugerido não pode ser negativo");
    }

    const agora = new Date();

    return new Produto({
      id: randomUUID(),
      negocioId,
      nome,
      descricao: props.descricao?.trim() || null,
      categoriaId: props.categoriaId?.trim() || null,
      tipoUso: props.tipoUso,
      unidadeMedida: props.unidadeMedida,
      custoReferencia: props.custoReferencia ?? null,
      precoVendaSugerido: props.precoVendaSugerido ?? null,
      status: "ATIVO",
      observacoes: props.observacoes?.trim() || null,
      alteracoes: [],
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  // --- Registro de alterações (histórico flexível) ---

  private registrarAlteracao(
    campo: string,
    valorAnterior: string | number | boolean | Date | null | undefined,
    valorNovo: string | number | boolean | Date | null | undefined,
    descricao?: string | null,
    alteradoPor?: string | null,
  ): void {
    this.props.alteracoes.push({
      campo,
      valorAnterior,
      valorNovo,
      descricao: descricao ?? null,
      alteradoPor: alteradoPor ?? null,
      alteradoEm: new Date(),
    });
    this.props.atualizadoEm = new Date();
  }

  // --- Dados principais ---

  atualizarNome(nome: string, alteradoPor?: string | null): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new CatalogoError("Nome do produto é obrigatório");
    }
    this.registrarAlteracao("nome", this.props.nome, nomeNormalizado, null, alteradoPor);
    this.props.nome = nomeNormalizado;
  }

  atualizarDescricao(descricao: string | null, alteradoPor?: string | null): void {
    const novaDescricao = descricao?.trim() || null;
    this.registrarAlteracao(
      "descricao",
      this.props.descricao,
      novaDescricao,
      null,
      alteradoPor,
    );
    this.props.descricao = novaDescricao;
  }

  alterarCategoria(categoriaId: string | null, alteradoPor?: string | null): void {
    const novaCategoria = categoriaId?.trim() || null;
    this.registrarAlteracao(
      "categoriaId",
      this.props.categoriaId,
      novaCategoria,
      null,
      alteradoPor,
    );
    this.props.categoriaId = novaCategoria;
  }

  alterarTipoUso(tipoUso: TipoUsoProduto, alteradoPor?: string | null): void {
    if (!tipoUso) {
      throw new CatalogoError("Tipo de uso do produto é obrigatório");
    }
    this.registrarAlteracao("tipoUso", this.props.tipoUso, tipoUso, null, alteradoPor);
    this.props.tipoUso = tipoUso;
  }

  alterarUnidadeMedida(
    unidadeMedida: UnidadeMedida,
    alteradoPor?: string | null,
  ): void {
    if (!unidadeMedida) {
      throw new CatalogoError("Unidade de medida é obrigatória");
    }
    this.registrarAlteracao(
      "unidadeMedida",
      this.props.unidadeMedida,
      unidadeMedida,
      null,
      alteradoPor,
    );
    this.props.unidadeMedida = unidadeMedida;
  }

  atualizarCustoReferencia(valor: number | null, alteradoPor?: string | null): void {
    if (valor != null && valor < 0) {
      throw new CatalogoError("Custo de referência não pode ser negativo");
    }
    const novoValor = valor ?? null;
    this.registrarAlteracao(
      "custoReferencia",
      this.props.custoReferencia,
      novoValor,
      null,
      alteradoPor,
    );
    this.props.custoReferencia = novoValor;
  }

  atualizarPrecoVendaSugerido(
    valor: number | null,
    alteradoPor?: string | null,
  ): void {
    if (valor != null && valor < 0) {
      throw new CatalogoError("Preço de venda sugerido não pode ser negativo");
    }
    const novoValor = valor ?? null;
    this.registrarAlteracao(
      "precoVendaSugerido",
      this.props.precoVendaSugerido,
      novoValor,
      null,
      alteradoPor,
    );
    this.props.precoVendaSugerido = novoValor;
  }

  atualizarObservacoes(observacoes: string | null, alteradoPor?: string | null): void {
    const novasObservacoes = observacoes?.trim() || null;
    this.registrarAlteracao(
      "observacoes",
      this.props.observacoes,
      novasObservacoes,
      null,
      alteradoPor,
    );
    this.props.observacoes = novasObservacoes;
  }

  // --- Status ---

  ativar(alteradoPor?: string | null): void {
    if (this.props.status === "ATIVO") {
      return;
    }
    this.registrarAlteracao("status", this.props.status, "ATIVO", null, alteradoPor);
    this.props.status = "ATIVO";
  }

  inativar(alteradoPor?: string | null): void {
    if (this.props.status === "INATIVO") {
      return;
    }
    this.registrarAlteracao("status", this.props.status, "INATIVO", null, alteradoPor);
    this.props.status = "INATIVO";
  }

  // --- Getters ---

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

  get categoriaId(): string | null | undefined {
    return this.props.categoriaId;
  }

  get tipoUso(): TipoUsoProduto {
    return this.props.tipoUso;
  }

  get unidadeMedida(): UnidadeMedida {
    return this.props.unidadeMedida;
  }

  get custoReferencia(): number | null | undefined {
    return this.props.custoReferencia;
  }

  get precoVendaSugerido(): number | null | undefined {
    return this.props.precoVendaSugerido;
  }

  get status(): ProdutoProps["status"] {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get alteracoes(): ProdutoProps["alteracoes"] {
    return this.props.alteracoes.map((alteracao) => ({ ...alteracao }));
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
