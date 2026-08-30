import { randomUUID } from "crypto";
import { CatalogoError } from "./CatalogoError";
import { ServicoProps, CriarServicoProps } from "./ServicoProps";

// Serviço do catálogo — modelo/base do que pode ser executado (ex: polimento).
// Orçamento e ordem de serviço o referenciam por servicoId/referenciaId.
export class Servico {
  private constructor(private readonly props: ServicoProps) {}

  // Obrigatórios: negocioId, nome e precoBase. Decisões: preço base e duração
  // estimada não podem ser negativos; duração é opcional (serviço sem tempo
  // definido); status inicial ATIVO; orçamento/OS copiam o valor no snapshot.
  static criar(props: CriarServicoProps): Servico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new CatalogoError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new CatalogoError("Nome do serviço é obrigatório");
    }
    if (props.precoBase < 0) {
      throw new CatalogoError("Preço base do serviço não pode ser negativo");
    }
    if (props.duracaoEstimadaMinutos != null && props.duracaoEstimadaMinutos < 0) {
      throw new CatalogoError("Duração estimada não pode ser negativa");
    }

    const agora = new Date();

    return new Servico({
      id: randomUUID(),
      negocioId,
      nome,
      descricao: props.descricao?.trim() || null,
      categoriaId: props.categoriaId?.trim() || null,
      precoBase: props.precoBase,
      duracaoEstimadaMinutos: props.duracaoEstimadaMinutos ?? null,
      status: "ATIVO",
      observacoes: props.observacoes?.trim() || null,
      alteracoes: [],
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  // Padrão do domínio (ver ItemOrcamento.reconstituir); usado pelos mappers
  // da Infrastructure ao carregar um serviço do banco. Não gera novo id.
  static reconstituir(props: ServicoProps): Servico {
    return new Servico(props);
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

  // Padrão: normalizar → validar → registrar → alterar estado (atualizadoEm
  // é atualizado junto com o histórico).
  atualizarNome(nome: string, alteradoPor?: string | null): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new CatalogoError("Nome do serviço é obrigatório");
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

  alterarPrecoBase(precoBase: number, alteradoPor?: string | null): void {
    if (precoBase < 0) {
      throw new CatalogoError("Preço base do serviço não pode ser negativo");
    }
    this.registrarAlteracao(
      "precoBase",
      this.props.precoBase,
      precoBase,
      null,
      alteradoPor,
    );
    this.props.precoBase = precoBase;
  }

  alterarDuracaoEstimada(
    minutos: number | null,
    alteradoPor?: string | null,
  ): void {
    if (minutos != null && minutos < 0) {
      throw new CatalogoError("Duração estimada não pode ser negativa");
    }
    const novosMinutos = minutos ?? null;
    this.registrarAlteracao(
      "duracaoEstimadaMinutos",
      this.props.duracaoEstimadaMinutos,
      novosMinutos,
      null,
      alteradoPor,
    );
    this.props.duracaoEstimadaMinutos = novosMinutos;
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

  get precoBase(): number {
    return this.props.precoBase;
  }

  get duracaoEstimadaMinutos(): number | null | undefined {
    return this.props.duracaoEstimadaMinutos;
  }

  get status(): ServicoProps["status"] {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get alteracoes(): ServicoProps["alteracoes"] {
    return this.props.alteracoes.map((alteracao) => ({ ...alteracao }));
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
