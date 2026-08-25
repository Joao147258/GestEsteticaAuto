import { randomUUID } from "crypto";
import { OperacaoError } from "./OperacaoError";
import { OrdemServicoProps, CriarOrdemServicoProps } from "./OrdemServicoProps";
import { ItemOrdemServico } from "./item_ordem_servico";
import { ItemOrdemServicoProps, CriarItemOrdemServicoProps } from "./ItemOrdemServicoProps";
import { InspecaoEntrada } from "./inspecao_entrada";
import { InspecaoEntradaProps, CriarInspecaoEntradaProps } from "./InspecaoEntradaProps";
import { ChecklistVeiculo } from "./checklist_veiculo";
import { ChecklistVeiculoProps, CriarChecklistVeiculoProps } from "./ChecklistVeiculoProps";
import { RegistroFotografico } from "./registro_fotografico";
import { RegistroFotograficoProps, CriarRegistroFotograficoProps } from "./RegistroFotograficoProps";
import { ObservacaoTecnica } from "./observacao_tecnica";
import { ObservacaoTecnicaProps, CriarObservacaoTecnicaProps } from "./ObservacaoTecnicaProps";
import { StatusOrdemServico } from "./status_ordem_servico_types";
import { DadosAlteracaoOperacao } from "./operacao_types";

// OrdemServico — agregado principal da operação.
// Representa o trabalho que será executado no veículo (sem lógica comercial).
export class OrdemServico {
  private constructor(private readonly props: OrdemServicoProps) {}

  static criar(props: CriarOrdemServicoProps): OrdemServico {
    const negocioId = props.negocioId?.trim();
    if (!negocioId) {
      throw new OperacaoError("Negócio é obrigatório");
    }
    const clienteId = props.clienteId?.trim();
    if (!clienteId) {
      throw new OperacaoError("Cliente é obrigatório");
    }
    const veiculoId = props.veiculoId?.trim();
    if (!veiculoId) {
      throw new OperacaoError("Veículo é obrigatório");
    }

    return new OrdemServico({
      id: randomUUID(),
      negocioId,
      clienteId,
      veiculoId,
      orcamentoId: props.orcamentoId?.trim() || null,
      agendamentoId: props.agendamentoId?.trim() || null,
      numero: props.numero?.trim() || null,
      itens: [],
      inspecaoEntrada: null,
      checklist: null,
      fotos: [],
      observacoesTecnicas: [],
      status: "ABERTA",
      responsavelId: props.responsavelId?.trim() || null,
      abertaEm: new Date(),
      iniciadaEm: null,
      pausadaEm: null,
      finalizadaEm: null,
      canceladaEm: null,
      observacoes: props.observacoes?.trim() || null,
      alteracoes: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // ----- Itens (execução) -----

  // O orçamento injeta negocioId/ordemServicoId — o chamador não informa.
  adicionarItem(
    dados: Omit<CriarItemOrdemServicoProps, "negocioId" | "ordemServicoId">,
  ): string {
    this.validarEmEdicao();
    const item = ItemOrdemServico.criar({
      ...dados,
      negocioId: this.props.negocioId,
      ordemServicoId: this.props.id,
    });
    const totalAntes = this.props.itens.length;
    this.props.itens.push(item.toProps());
    this.registrarAlteracao(
      "itens",
      `${totalAntes} item(ns)`,
      `${this.props.itens.length} item(ns)`,
      { descricao: `item adicionado: ${dados.descricao}` },
    );
    return item.id;
  }

  removerItem(itemId: string): void {
    this.validarEmEdicao();
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new OperacaoError("Item não encontrado");
    }
    const [removido] = this.props.itens.splice(index, 1);
    this.registrarAlteracao(
      "itens",
      `${this.props.itens.length + 1} item(ns)`,
      `${this.props.itens.length} item(ns)`,
      { descricao: `item removido: ${removido.descricao}` },
    );
  }

  iniciarItem(itemId: string): void {
    this.validarEmExecucao();
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new OperacaoError("Item não encontrado");
    }
    const item = ItemOrdemServico.reconstituir(this.props.itens[index]);
    item.iniciar();
    this.props.itens[index] = item.toProps();
    this.registrarAlteracao("item", "PENDENTE", "EM_EXECUCAO", {
      descricao: `item iniciado: ${item.descricao}`,
    });
  }

  concluirItem(itemId: string): void {
    this.validarEmExecucao();
    const index = this.props.itens.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new OperacaoError("Item não encontrado");
    }
    const item = ItemOrdemServico.reconstituir(this.props.itens[index]);
    const anterior = item.status;
    item.concluir();
    this.props.itens[index] = item.toProps();
    this.registrarAlteracao("item", anterior, "CONCLUIDO", {
      descricao: `item concluído: ${item.descricao}`,
    });
  }

  // ----- Ciclo de vida -----

  aguardarVeiculo(): void {
    if (this.props.status !== "ABERTA") {
      throw new OperacaoError("Apenas ordem ABERTA pode aguardar veículo");
    }
    this.transicionar("AGUARDANDO_VEICULO", { descricao: "ordem aguardando entrada do veículo" });
  }

  iniciar(): void {
    if (this.props.status !== "ABERTA" && this.props.status !== "AGUARDANDO_VEICULO") {
      throw new OperacaoError("Apenas ordem ABERTA ou AGUARDANDO_VEICULO pode ser iniciada");
    }
    this.transicionar("EM_EXECUCAO", { descricao: "ordem iniciada após entrada do veículo" });
    this.props.iniciadaEm = new Date();
    this.props.atualizadoEm = new Date();
  }

  pausar(): void {
    if (this.props.status !== "EM_EXECUCAO") {
      throw new OperacaoError("Apenas ordem EM_EXECUCAO pode ser pausada");
    }
    this.transicionar("PAUSADA", { descricao: "execução pausada" });
    this.props.pausadaEm = new Date();
    this.props.atualizadoEm = new Date();
  }

  retomar(): void {
    if (this.props.status !== "PAUSADA") {
      throw new OperacaoError("Apenas ordem PAUSADA pode ser retomada");
    }
    this.transicionar("EM_EXECUCAO", { descricao: "execução retomada" });
    this.props.pausadaEm = null;
    this.props.atualizadoEm = new Date();
  }

  concluir(): void {
    if (this.props.status !== "EM_EXECUCAO" && this.props.status !== "PAUSADA") {
      throw new OperacaoError("Apenas ordem EM_EXECUCAO ou PAUSADA pode ser concluída");
    }
    if (this.props.itens.length === 0) {
      throw new OperacaoError("Ordem sem itens não pode ser concluída");
    }
    const pendenteOuEmExecucao = this.props.itens.some(
      (item) => item.status === "PENDENTE" || item.status === "EM_EXECUCAO",
    );
    if (pendenteOuEmExecucao) {
      throw new OperacaoError(
        "Ordem com item pendente ou em execução não pode ser concluída",
      );
    }
    this.transicionar("CONCLUIDA", { descricao: "ordem concluída" });
    this.props.finalizadaEm = new Date();
    this.props.atualizadoEm = new Date();
  }

  cancelar(dados?: DadosAlteracaoOperacao): void {
    if (this.props.status === "CONCLUIDA" || this.props.status === "CANCELADA") {
      throw new OperacaoError("Ordem já finalizada não pode ser cancelada");
    }
    this.transicionar("CANCELADA", dados ?? { descricao: "ordem cancelada" });
    this.props.canceladaEm = new Date();
    this.props.atualizadoEm = new Date();
  }

  // ----- Registros operacionais -----

  registrarInspecaoEntrada(
    dados: Omit<CriarInspecaoEntradaProps, "negocioId" | "ordemServicoId" | "veiculoId">,
  ): string {
    this.validarNaoEncerrada();
    const inspecao = InspecaoEntrada.criar({
      ...dados,
      negocioId: this.props.negocioId,
      ordemServicoId: this.props.id,
      veiculoId: this.props.veiculoId,
    });
    this.props.inspecaoEntrada = inspecao.toProps();
    this.registrarAlteracao("inspecaoEntrada", "", "registrada", {
      descricao: "inspeção de entrada registrada",
    });
    return inspecao.id;
  }

  adicionarChecklist(
    dados: Omit<CriarChecklistVeiculoProps, "negocioId" | "ordemServicoId" | "veiculoId">,
  ): string {
    this.validarNaoEncerrada();
    const checklist = ChecklistVeiculo.criar({
      ...dados,
      negocioId: this.props.negocioId,
      ordemServicoId: this.props.id,
      veiculoId: this.props.veiculoId,
    });
    this.props.checklist = checklist.toProps();
    this.registrarAlteracao("checklist", "", "registrado", {
      descricao: "checklist registrado",
    });
    return checklist.id;
  }

  adicionarFoto(
    dados: Omit<CriarRegistroFotograficoProps, "negocioId" | "ordemServicoId" | "veiculoId">,
  ): string {
    this.validarNaoEncerrada();
    const foto = RegistroFotografico.criar({
      ...dados,
      negocioId: this.props.negocioId,
      ordemServicoId: this.props.id,
      veiculoId: this.props.veiculoId,
    });
    this.props.fotos.push(foto.toProps());
    this.registrarAlteracao(
      "fotos",
      `${this.props.fotos.length - 1} foto(s)`,
      `${this.props.fotos.length} foto(s)`,
      { descricao: `foto adicionada (${dados.tipo})` },
    );
    return foto.id;
  }

  adicionarObservacaoTecnica(
    dados: Omit<CriarObservacaoTecnicaProps, "negocioId" | "ordemServicoId">,
  ): string {
    this.validarNaoEncerrada();
    const observacao = ObservacaoTecnica.criar({
      ...dados,
      negocioId: this.props.negocioId,
      ordemServicoId: this.props.id,
    });
    this.props.observacoesTecnicas.push(observacao.toProps());
    this.registrarAlteracao(
      "observacoesTecnicas",
      `${this.props.observacoesTecnicas.length - 1} obs(s)`,
      `${this.props.observacoesTecnicas.length} obs(s)`,
      { descricao: `observação técnica adicionada (${dados.tipo})` },
    );
    return observacao.id;
  }

  // ----- Helpers privados -----

  // Itens podem ser editados apenas antes do início da execução.
  private validarEmEdicao(): void {
    if (this.props.status !== "ABERTA" && this.props.status !== "AGUARDANDO_VEICULO") {
      throw new OperacaoError("Ordem não pode ter itens alterados neste status");
    }
  }

  // Ações de item exigem ordem em execução (ou pausada).
  private validarEmExecucao(): void {
    if (this.props.status !== "EM_EXECUCAO" && this.props.status !== "PAUSADA") {
      throw new OperacaoError("Ação de item exige ordem em execução");
    }
  }

  private validarNaoEncerrada(): void {
    if (this.props.status === "CONCLUIDA" || this.props.status === "CANCELADA") {
      throw new OperacaoError("Ordem encerrada não aceita novos registros");
    }
  }

  private transicionar(
    statusNovo: StatusOrdemServico,
    dados?: DadosAlteracaoOperacao,
  ): void {
    this.registrarAlteracao("status", this.props.status, statusNovo, dados);
    this.props.status = statusNovo;
    this.props.atualizadoEm = new Date();
  }

  private registrarAlteracao(
    campo: string,
    valorAnterior: unknown,
    valorNovo: unknown,
    dados?: DadosAlteracaoOperacao,
  ): void {
    this.props.alteracoes.push({
      campo,
      valorAnterior: String(valorAnterior ?? ""),
      valorNovo: String(valorNovo ?? ""),
      descricao: dados?.descricao?.trim() || null,
      alteradoPor: dados?.alteradoPor ?? null,
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

  get veiculoId(): string {
    return this.props.veiculoId;
  }

  get orcamentoId(): string | null | undefined {
    return this.props.orcamentoId;
  }

  get agendamentoId(): string | null | undefined {
    return this.props.agendamentoId;
  }

  get numero(): string | null | undefined {
    return this.props.numero;
  }

  get itens(): ItemOrdemServicoProps[] {
    return this.props.itens.map((item) => ({ ...item }));
  }

  get inspecaoEntrada(): InspecaoEntradaProps | null | undefined {
    return this.props.inspecaoEntrada ? { ...this.props.inspecaoEntrada } : null;
  }

  get checklist(): ChecklistVeiculoProps | null | undefined {
    return this.props.checklist ? { ...this.props.checklist } : null;
  }

  get fotos(): RegistroFotograficoProps[] {
    return this.props.fotos.map((foto) => ({ ...foto }));
  }

  get observacoesTecnicas(): ObservacaoTecnicaProps[] {
    return this.props.observacoesTecnicas.map((obs) => ({ ...obs }));
  }

  get status(): StatusOrdemServico {
    return this.props.status;
  }

  get responsavelId(): string | null | undefined {
    return this.props.responsavelId;
  }

  get abertaEm(): Date {
    return this.props.abertaEm;
  }

  get iniciadaEm(): Date | null | undefined {
    return this.props.iniciadaEm;
  }

  get pausadaEm(): Date | null | undefined {
    return this.props.pausadaEm;
  }

  get finalizadaEm(): Date | null | undefined {
    return this.props.finalizadaEm;
  }

  get canceladaEm(): Date | null | undefined {
    return this.props.canceladaEm;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get alteracoes(): OrdemServicoProps["alteracoes"] {
    return this.props.alteracoes.map((alteracao) => ({ ...alteracao }));
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
