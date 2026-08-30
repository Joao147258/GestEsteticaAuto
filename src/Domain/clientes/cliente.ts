import { randomUUID } from "crypto";
import { ClienteError } from "./ClienteError";
import { ClienteProps, CriarClienteProps } from "./ClienteProps";

// Agregado raiz do domínio de clientes.
// Guarda dados cadastrais e relacionamento; sem regras de outros módulos.
// Orçamento, financeiro e operação o referenciam por clienteId.
export class Cliente {
  private constructor(private readonly props: ClienteProps) {}

  // --- Criação ---
 
  // Decisões da criação: obrigatórios são negocioId, nome e tipo; campos
  // opcionais são normalizados (trim) e viram null quando vazios; status
  // inicial ATIVO; listas de composição e histórico começam vazias.
  static criar(props: CriarClienteProps): Cliente {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new ClienteError("Negócio é obrigatório");
    }
    const nome = props.nome?.trim();
    if (!nome) {
      throw new ClienteError("Nome é obrigatório");
    }
    if (!props.tipo) {
      throw new ClienteError("Tipo de cliente é obrigatório");
    } 

    const agora = new Date();

    return new Cliente({
      id: randomUUID(),
      negocioId,
      nome,
      tipo: props.tipo,
      documento: props.documento?.trim() ?? null,
      email: props.email?.trim() ?? null,
      telefone: props.telefone?.trim() ?? null,
      status: "ATIVO",
      observacoes: props.observacoes?.trim() ?? null,
      origemId: props.origemId?.trim() ?? null,
      contatos: [],
      enderecos: [],
      preferencias: [],
      tags: [],
      anexos: [],
      alteracoes: [],
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  // Padrão do domínio (ver ItemOrcamento.reconstituir); usado pelos mappers
  // da Infrastructure ao carregar um cliente do banco. Não gera novo id.
  static reconstituir(props: ClienteProps): Cliente {
    return new Cliente(props);
  }

  // --- Registro de alterações (histórico flexível) ---

  // Todo método de ação registra a mudança aqui: campo + valor anterior/novo
  // + autor opcional. Decisão: histórico é lista interna de Props (sem tabela
  // separada) — suficiente para o MVP; auditoria dedicada fica no shared.
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

  // Padrão dos métodos de atualização: normalizar (trim) → validar o que é
  // obrigatório → registrar no histórico → atualizar atualizadoEm (feito em
  // registrarAlteracao). Campos opcionais aceitam null para limpar o valor.
  atualizarNome(nome: string, alteradoPor?: string | null): void {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new ClienteError("Nome é obrigatório");
    }
    const valorAnterior = this.props.nome;
    this.props.nome = nomeNormalizado;
    this.registrarAlteracao("nome", valorAnterior, nomeNormalizado, null, alteradoPor);
  }

  // Aceita null para limpar o telefone principal quando necessário.
  atualizarTelefone(telefone: string | null, alteradoPor?: string | null): void {
    const telefoneNormalizado = telefone?.trim() ?? null;
    const valorAnterior = this.props.telefone ?? null;
    this.props.telefone = telefoneNormalizado;
    this.registrarAlteracao(
      "telefone",
      valorAnterior,
      telefoneNormalizado,
      null,
      alteradoPor,
    );
  }

  atualizarEmail(email: string | null, alteradoPor?: string | null): void {
    const emailNormalizado = email?.trim() ?? null;
    const valorAnterior = this.props.email ?? null;
    this.props.email = emailNormalizado;
    this.registrarAlteracao("email", valorAnterior, emailNormalizado, null, alteradoPor);
  }

  atualizarDocumento(documento: string | null, alteradoPor?: string | null): void {
    const documentoNormalizado = documento?.trim() ?? null;
    const valorAnterior = this.props.documento ?? null;
    this.props.documento = documentoNormalizado;
    this.registrarAlteracao(
      "documento",
      valorAnterior,
      documentoNormalizado,
      null,
      alteradoPor,
    );
  }

  atualizarObservacoes(observacoes: string | null, alteradoPor?: string | null): void {
    const observacoesNormalizadas = observacoes?.trim() ?? null;
    const valorAnterior = this.props.observacoes ?? null;
    this.props.observacoes = observacoesNormalizadas;
    this.registrarAlteracao(
      "observacoes",
      valorAnterior,
      observacoesNormalizadas,
      null,
      alteradoPor,
    );
  }

  atualizarOrigem(origemId: string | null, alteradoPor?: string | null): void {
    const origemNormalizada = origemId?.trim() ?? null;
    const valorAnterior = this.props.origemId ?? null;
    this.props.origemId = origemNormalizada;
    this.registrarAlteracao("origemId", valorAnterior, origemNormalizada, null, alteradoPor);
  }

  // --- Status ---

  // Ativar/inativar são idempotentes: se o status já é o desejado, não faz
  // nada (evita registrar alteração em vão). Inativar não apaga o cliente —
  // ele permanece para orçamentos e OS do passado.
  ativar(alteradoPor?: string | null): void {
    if (this.props.status === "ATIVO") {
      return;
    }
    const valorAnterior = this.props.status;
    this.props.status = "ATIVO";
    this.registrarAlteracao("status", valorAnterior, "ATIVO", null, alteradoPor);
  }

  inativar(alteradoPor?: string | null): void {
    if (this.props.status === "INATIVO") {
      return;
    }
    const valorAnterior = this.props.status;
    this.props.status = "INATIVO";
    this.registrarAlteracao("status", valorAnterior, "INATIVO", null, alteradoPor);
  }

  // --- Composição (adicionar/remover) ---

  adicionarContato(contato: ClienteProps["contatos"][number]): void {
    this.adicionarItem(this.props.contatos, contato, "contatos");
  }

  removerContato(contatoId: string): void {
    this.removerItem(this.props.contatos, contatoId, "contatos");
  }

  adicionarEndereco(endereco: ClienteProps["enderecos"][number]): void {
    this.adicionarItem(this.props.enderecos, endereco, "enderecos");
  }

  removerEndereco(enderecoId: string): void {
    this.removerItem(this.props.enderecos, enderecoId, "enderecos");
  }

  adicionarPreferencia(preferencia: ClienteProps["preferencias"][number]): void {
    this.adicionarItem(this.props.preferencias, preferencia, "preferencias");
  }

  removerPreferencia(preferenciaId: string): void {
    this.removerItem(this.props.preferencias, preferenciaId, "preferencias");
  }

  adicionarTag(tag: ClienteProps["tags"][number]): void {
    this.adicionarItem(this.props.tags, tag, "tags");
  }

  removerTag(tagId: string): void {
    this.removerItem(this.props.tags, tagId, "tags");
  }

  adicionarAnexo(anexo: ClienteProps["anexos"][number]): void {
    this.adicionarItem(this.props.anexos, anexo, "anexos");
  }

  removerAnexo(anexoId: string): void {
    this.removerItem(this.props.anexos, anexoId, "anexos");
  }

  // --- Auxiliares de composição ---

  // Adicionar/remover itens de composição (contatos, endereços, preferências,
  // tags, anexos) com duas proteções: item sem id é rejeitado e id duplicado
  // também — decisão para manter cada lista consistente por id e evitar
  // duplicidade acidental.
  private adicionarItem<T extends { id: string }>(
    itens: T[],
    item: T,
    nomeLista: string,
  ): void {
    if (!item.id) {
      throw new ClienteError(`Item sem id não pode ser adicionado em ${nomeLista}`);
    }
    if (itens.some((atual) => atual.id === item.id)) {
      throw new ClienteError(`Item ${item.id} já existe em ${nomeLista}`);
    }
    itens.push(item);
    this.registrarAlteracao(nomeLista, null, item.id, `${nomeLista} atualizado`);
  }

  private removerItem(
    itens: { id: string }[],
    itemId: string,
    nomeLista: string,
  ): void {
    const indice = itens.findIndex((atual) => atual.id === itemId);
    if (indice === -1) {
      throw new ClienteError(`Item ${itemId} não encontrado em ${nomeLista}`);
    }
    itens.splice(indice, 1);
    this.registrarAlteracao(nomeLista, itemId, null, `${nomeLista} atualizado`);
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

  get tipo(): ClienteProps["tipo"] {
    return this.props.tipo;
  }

  get documento(): string | null | undefined {
    return this.props.documento;
  }

  get email(): string | null | undefined {
    return this.props.email;
  }

  get telefone(): string | null | undefined {
    return this.props.telefone;
  }

  get status(): ClienteProps["status"] {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get origemId(): string | null | undefined {
    return this.props.origemId;
  }

  get contatos(): ClienteProps["contatos"] {
    return this.props.contatos;
  }

  get enderecos(): ClienteProps["enderecos"] {
    return this.props.enderecos;
  }

  get preferencias(): ClienteProps["preferencias"] {
    return this.props.preferencias;
  }

  get tags(): ClienteProps["tags"] {
    return this.props.tags;
  }

  get anexos(): ClienteProps["anexos"] {
    return this.props.anexos;
  }

  get alteracoes(): ClienteProps["alteracoes"] {
    return this.props.alteracoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
