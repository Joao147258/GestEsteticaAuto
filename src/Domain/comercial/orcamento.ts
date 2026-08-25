import { randomUUID } from "crypto";
import { ComercialError } from "./ComercialError";
import { OrcamentoProps, CriarOrcamentoProps } from "./OrcamentoProps";
import { ItemOrcamento } from "./item_orcamento";
import { ItemOrcamentoProps, CriarItemOrcamentoProps } from "./ItemOrcamentoProps";
import { AceiteOrcamento } from "./aceite_orcamento";
import { AceiteOrcamentoProps } from "./AceiteOrcamentoProps";
import { CanalAceiteOrcamento } from "./status_aceite_orcamento_types";
import { StatusOrcamento } from "./status_orcamento_types";
import { DadosAlteracaoComercial } from "./comercial_types";

// Orcamento — agregado principal do comercial.
// Representa uma proposta feita para um cliente; os valores são calculados
// pelo próprio orçamento (subtotal, desconto, acréscimo e total).
// Itens referenciam o catálogo, mas preservam os valores negociados;
// pagamento pertence ao financeiro e execução pertence à operação.
export class Orcamento {
  private constructor(private readonly props: OrcamentoProps) {}

  // Obrigatórios: negocioId e clienteId. Decisões: valores começam zerados
  // (nunca recebidos de fora — são calculados); status inicial RASCUNHO;
  // itens/aceite/histórico vazios; veiculoId, política e condição opcionais.
  static criar(props: CriarOrcamentoProps): Orcamento {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new ComercialError("Negócio é obrigatório");
    }
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new ComercialError("Cliente é obrigatório");
    }

    return new Orcamento({
      id: randomUUID(),
      negocioId,
      clienteId,
      veiculoId: props.veiculoId?.trim() || null,
      itens: [],
      politicaComercialId: props.politicaComercialId?.trim() || null,
      condicaoComercialId: props.condicaoComercialId?.trim() || null,
      subtotal: 0,
      valorDesconto: 0,
      valorAcrescimo: 0,
      valorTotal: 0,
      status: "RASCUNHO",
      observacoes: props.observacoes?.trim() || null,
      validoAte: props.validoAte ?? null,
      aceite: null,
      alteracoes: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // ----- Montagem do orçamento (RASCUNHO / EM_ABERTO) -----

  // O orçamento injeta negocioId/orcamentoId — o chamador não precisa informá-los.
  adicionarItem(
    dados: Omit<CriarItemOrcamentoProps, "negocioId" | "orcamentoId">,
  ): string {
    this.validarEditavel();
    const item = ItemOrcamento.criar({
      ...dados,
      negocioId: this.props.negocioId,
      orcamentoId: this.props.id,
    });
    const totalAntes = this.props.itens.length;
    this.props.itens.push(item.toProps());
    this.registrarAlteracao(
      "itens",
      `${totalAntes} item(ns)`,
      `${this.props.itens.length} item(ns)`,
      { descricao: `item adicionado: ${dados.descricao}` },
    );
    this.recalcular();
    return item.id;
  }

  removerItem(itemId: string): void {
    this.validarEditavel();
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new ComercialError("Item não encontrado");
    }
    const [removido] = this.props.itens.splice(index, 1);
    this.registrarAlteracao(
      "itens",
      `${this.props.itens.length + 1} item(ns)`,
      `${this.props.itens.length} item(ns)`,
      { descricao: `item removido: ${removido.descricao}` },
    );
    this.recalcular();
  }

  // Edição de item segue o padrão: reconstituir a entidade → validar/alterar
  // → projetar de volta (toProps) → recalcular os totais do orçamento.
  alterarQuantidadeItem(itemId: string, quantidade: number): void {
    this.validarEditavel();
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new ComercialError("Item não encontrado");
    }
    const item = ItemOrcamento.reconstituir(this.props.itens[index]);
    const anterior = item.quantidade;
    item.alterarQuantidade(quantidade);
    this.props.itens[index] = item.toProps();
    this.registrarAlteracao(
      `quantidade do item ${item.descricao}`,
      anterior,
      quantidade,
    );
    this.recalcular();
  }

  alterarValorUnitarioItem(itemId: string, valorUnitario: number): void {
    this.validarEditavel();
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new ComercialError("Item não encontrado");
    }
    const item = ItemOrcamento.reconstituir(this.props.itens[index]);
    const anterior = item.valorUnitario;
    item.alterarValorUnitario(valorUnitario);
    this.props.itens[index] = item.toProps();
    this.registrarAlteracao(
      `valor unitário do item ${item.descricao}`,
      anterior,
      valorUnitario,
    );
    this.recalcular();
  }

  // Desconto aplicado no total (não por item). Decisões: nunca negativo e
  // nunca maior que o subtotal — evita orçamento com total negativo.
  aplicarDesconto(valor: number, dados?: DadosAlteracaoComercial): void {
    this.validarEditavel();
    if (valor < 0) {
      throw new ComercialError("Desconto não pode ser negativo");
    }
    if (valor > this.props.subtotal) {
      throw new ComercialError("Desconto não pode ser maior que o subtotal");
    }
    this.registrarAlteracao("valorDesconto", this.props.valorDesconto, valor, dados);
    this.props.valorDesconto = valor;
    this.recalcular();
  }

  aplicarAcrescimo(valor: number, dados?: DadosAlteracaoComercial): void {
    this.validarEditavel();
    if (valor < 0) {
      throw new ComercialError("Acréscimo não pode ser negativo");
    }
    this.registrarAlteracao("valorAcrescimo", this.props.valorAcrescimo, valor, dados);
    this.props.valorAcrescimo = valor;
    this.recalcular();
  }

  aplicarCondicaoComercial(
    condicaoComercialId: string,
    dados?: DadosAlteracaoComercial,
  ): void {
    this.validarEditavel();
    const id = condicaoComercialId?.trim();
    if (!id) {
      throw new ComercialError("Condição comercial é obrigatória");
    }
    this.registrarAlteracao(
      "condicaoComercialId",
      this.props.condicaoComercialId,
      id,
      dados,
    );
    this.props.condicaoComercialId = id;
    this.props.atualizadoEm = new Date();
  }

  // ----- Ciclo de vida -----

  // Finaliza a montagem e libera o orçamento para aceite/recusa.
  abrir(dados?: DadosAlteracaoComercial): void {
    if (this.props.status !== "RASCUNHO") {
      throw new ComercialError("Apenas orçamento RASCUNHO pode ser aberto");
    }
    this.transicionar("EM_ABERTO", dados);
  }

  // Aceitar gera um AceiteOrcamento PENDENTE e o registra como ACEITO na
  // mesma operação — decisão: no MVP o cliente decide por canal no ato.
  aceitar(
    canal?: CanalAceiteOrcamento | null,
    observacoes?: string | null,
  ): void {
    if (this.props.status !== "EM_ABERTO") {
      throw new ComercialError("Apenas orçamento EM_ABERTO pode ser aceito");
    }
    if (this.props.itens.length === 0) {
      throw new ComercialError("Orçamento sem itens não pode ser aceito");
    }
    const aceite = AceiteOrcamento.criar({
      negocioId: this.props.negocioId,
      orcamentoId: this.props.id,
      clienteId: this.props.clienteId,
      canal,
      observacoes,
    });
    aceite.registrarAceite(canal, observacoes);
    this.props.aceite = aceite.toProps();
    this.transicionar("ACEITO", { descricao: "orçamento aceito pelo cliente" });
  }

  recusar(
    canal?: CanalAceiteOrcamento | null,
    observacoes?: string | null,
  ): void {
    if (this.props.status !== "EM_ABERTO") {
      throw new ComercialError("Apenas orçamento EM_ABERTO pode ser recusado");
    }
    const aceite = AceiteOrcamento.criar({
      negocioId: this.props.negocioId,
      orcamentoId: this.props.id,
      clienteId: this.props.clienteId,
      canal,
      observacoes,
    });
    aceite.registrarRecusa(canal, observacoes);
    this.props.aceite = aceite.toProps();
    this.transicionar("RECUSADO", { descricao: "orçamento recusado pelo cliente" });
  }

  cancelar(dados?: DadosAlteracaoComercial): void {
    if (this.props.status === "ACEITO" || this.props.status === "RECUSADO") {
      throw new ComercialError("Orçamento já finalizado não pode ser cancelado");
    }
    if (this.props.status === "CANCELADO" || this.props.status === "EXPIRADO") {
      throw new ComercialError("Orçamento já está encerrado");
    }
    this.transicionar("CANCELADO", dados);
  }

  expirar(): void {
    if (this.props.status !== "EM_ABERTO") {
      throw new ComercialError("Apenas orçamento EM_ABERTO pode expirar");
    }
    this.transicionar("EXPIRADO", { descricao: "orçamento expirou" });
  }

  // ----- Helpers privados -----

  private validarEditavel(): void {
    if (this.props.status !== "RASCUNHO" && this.props.status !== "EM_ABERTO") {
      throw new ComercialError("Orçamento não pode ser alterado neste status");
    }
  }

  private transicionar(
    statusNovo: StatusOrcamento,
    dados?: DadosAlteracaoComercial,
  ): void {
    this.registrarAlteracao("status", this.props.status, statusNovo, dados);
    this.props.status = statusNovo;
    this.props.atualizadoEm = new Date();
  }

  // Todos os valores (subtotal, total) são SEMPRE calculados a partir dos
  // itens — decisão do projeto: nada de valor derivado vindo de fora.
  private recalcular(): void {
    this.props.subtotal = this.props.itens.reduce(
      (soma, item) => soma + item.valorTotal,
      0,
    );
    this.props.valorTotal =
      this.props.subtotal - this.props.valorDesconto + this.props.valorAcrescimo;
    this.props.atualizadoEm = new Date();
  }

  private registrarAlteracao(
    campo: string,
    valorAnterior: unknown,
    valorNovo: unknown,
    dados?: DadosAlteracaoComercial,
  ): void {
    this.props.alteracoes.push({
      campo,
      valorAnterior: String(valorAnterior ?? ""),
      valorNovo: String(valorNovo ?? ""),
      alteradoPor: dados?.alteradoPor ?? null,
      descricao: dados?.descricao?.trim() || null,
      alteradoEm: new Date(),
    });
  }

  // ----- Getters -----

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get veiculoId(): string | null | undefined {
    return this.props.veiculoId;
  }

  get itens(): ItemOrcamentoProps[] {
    return this.props.itens.map((item) => ({ ...item }));
  }

  get politicaComercialId(): string | null | undefined {
    return this.props.politicaComercialId;
  }

  get condicaoComercialId(): string | null | undefined {
    return this.props.condicaoComercialId;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get valorDesconto(): number {
    return this.props.valorDesconto;
  }

  get valorAcrescimo(): number {
    return this.props.valorAcrescimo;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get status(): StatusOrcamento {
    return this.props.status;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get validoAte(): Date | null | undefined {
    return this.props.validoAte;
  }

  get aceite(): AceiteOrcamentoProps | null | undefined {
    return this.props.aceite ? { ...this.props.aceite } : null;
  }

  get alteracoes(): OrcamentoProps["alteracoes"] {
    return this.props.alteracoes.map((alteracao) => ({ ...alteracao }));
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
