import { randomUUID } from "crypto";
import {
  CriarPoliticaComercialProps,
  PoliticaComercialProps,
  RegraFormaPagamento,
} from "./PoliticaComercialProps";
import { CondicaoComercial } from "./condicao_comercial";
import {
  DadosAlteracaoComercial,
  FormaPagamentoComercial,
  RegistroAlteracaoComercial,
} from "./comercial_types";
import { ComercialError } from "./ComercialError";

// PoliticaComercial — conjunto de regras comerciais gerais do negócio.
// Define os limites: formas de pagamento, desconto máximo, parcelas, sinal.
// Não é a venda; ela limita. Quem aplica é a CondicaoComercial.
export class PoliticaComercial {
  private constructor(private readonly props: PoliticaComercialProps) {}

  static criar(props: CriarPoliticaComercialProps): PoliticaComercial {
    PoliticaComercial.validarCriacao(props);

    return new PoliticaComercial({
      id: randomUUID(),
      negocioId: props.negocioId.trim(),
      nome: props.nome.trim(),
      descricao: props.descricao?.trim() || null,
      descontoMaximoPercentual: props.descontoMaximoPercentual,
      descontoMaximoValor: props.descontoMaximoValor ?? null,
      prazoValidadeDias: props.prazoValidadeDias,
      // Cópia das regras para não guardar a mesma referência recebida de fora.
      formasPagamento: props.formasPagamento.map((regra) => ({ ...regra })),
      jurosAtrasoPercentualMes: props.jurosAtrasoPercentualMes ?? null,
      multaAtrasoPercentual: props.multaAtrasoPercentual ?? null,
      permiteNegociacaoManual: props.permiteNegociacaoManual ?? false,
      exigeAprovacaoAcimaDoDescontoMaximo:
        props.exigeAprovacaoAcimaDoDescontoMaximo ?? true,
      status: "ATIVA",
      // A criação começa sem histórico, porque ainda não houve alteração.
      alteracoes: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  private static validarCriacao(props: CriarPoliticaComercialProps): void {
    if (!props.negocioId || !props.negocioId.trim()) {
      throw new ComercialError("negocioId é obrigatório");
    }
    if (!props.nome || !props.nome.trim()) {
      throw new ComercialError("nome da política comercial é obrigatório");
    }
    if (props.descontoMaximoPercentual < 0) {
      throw new ComercialError("desconto máximo percentual não pode ser negativo");
    }
    if (props.descontoMaximoPercentual > 100) {
      throw new ComercialError("desconto máximo percentual não pode ser maior que 100");
    }
    if (
      props.descontoMaximoValor !== undefined &&
      props.descontoMaximoValor !== null &&
      props.descontoMaximoValor < 0
    ) {
      throw new ComercialError("desconto máximo em valor não pode ser negativo");
    }
    if (props.prazoValidadeDias <= 0) {
      throw new ComercialError("prazo de validade deve ser maior que zero");
    }
    if (!props.formasPagamento.length) {
      throw new ComercialError(
        "política comercial precisa ter ao menos uma forma de pagamento",
      );
    }
    props.formasPagamento.forEach((regra) => {
      PoliticaComercial.validarRegraFormaPagamento(regra);
    });
    if (
      props.jurosAtrasoPercentualMes !== undefined &&
      props.jurosAtrasoPercentualMes !== null &&
      props.jurosAtrasoPercentualMes < 0
    ) {
      throw new ComercialError("juros por atraso não pode ser negativo");
    }
    if (
      props.multaAtrasoPercentual !== undefined &&
      props.multaAtrasoPercentual !== null &&
      props.multaAtrasoPercentual < 0
    ) {
      throw new ComercialError("multa por atraso não pode ser negativa");
    }
  }

  private static validarRegraFormaPagamento(regra: RegraFormaPagamento): void {
    if (!regra.forma) {
      throw new ComercialError("forma de pagamento é obrigatória");
    }
    if (regra.quantidadeMaximaParcelas <= 0) {
      throw new ComercialError(
        "quantidade máxima de parcelas deve ser maior que zero",
      );
    }
    if (!regra.permiteParcelamento && regra.quantidadeMaximaParcelas > 1) {
      throw new ComercialError(
        "forma de pagamento sem parcelamento não pode ter mais de uma parcela",
      );
    }
    if (
      regra.descontoAVistaPercentual !== undefined &&
      regra.descontoAVistaPercentual !== null &&
      (regra.descontoAVistaPercentual < 0 || regra.descontoAVistaPercentual > 100)
    ) {
      throw new ComercialError("desconto à vista deve estar entre 0 e 100");
    }
    if (
      regra.taxaMaquininhaPercentual !== undefined &&
      regra.taxaMaquininhaPercentual !== null &&
      regra.taxaMaquininhaPercentual < 0
    ) {
      throw new ComercialError("taxa de maquininha não pode ser negativa");
    }
    if (
      regra.percentualMinimoSinal !== undefined &&
      regra.percentualMinimoSinal !== null &&
      (regra.percentualMinimoSinal < 0 || regra.percentualMinimoSinal > 100)
    ) {
      throw new ComercialError("percentual mínimo de sinal deve estar entre 0 e 100");
    }
  }

  ativar(dados?: DadosAlteracaoComercial): void {
    if (this.props.status === "ATIVA") {
      return;
    }
    this.registrarAlteracao("status", this.props.status, "ATIVA", dados);
    this.props.status = "ATIVA";
    this.atualizarData();
  }

  inativar(dados?: DadosAlteracaoComercial): void {
    if (this.props.status === "INATIVA") {
      return;
    }
    this.registrarAlteracao("status", this.props.status, "INATIVA", dados);
    this.props.status = "INATIVA";
    this.atualizarData();
  }

  atualizarNome(nome: string, dados?: DadosAlteracaoComercial): void {
    if (!nome || !nome.trim()) {
      throw new ComercialError("nome da política comercial é obrigatório");
    }
    const novoNome = nome.trim();
    if (this.props.nome === novoNome) {
      return;
    }
    this.registrarAlteracao("nome", this.props.nome, novoNome, dados);
    this.props.nome = novoNome;
    this.atualizarData();
  }

  atualizarDescricao(
    descricao?: string | null,
    dados?: DadosAlteracaoComercial,
  ): void {
    const novaDescricao = descricao?.trim() || null;
    if (this.props.descricao === novaDescricao) {
      return;
    }
    this.registrarAlteracao(
      "descricao",
      this.props.descricao,
      novaDescricao,
      dados,
    );
    this.props.descricao = novaDescricao;
    this.atualizarData();
  }

  adicionarRegraFormaPagamento(
    regra: RegraFormaPagamento,
    dados?: DadosAlteracaoComercial,
  ): void {
    PoliticaComercial.validarRegraFormaPagamento(regra);
    const jaExiste = this.props.formasPagamento.some(
      (item) => item.forma === regra.forma,
    );
    if (jaExiste) {
      throw new ComercialError("forma de pagamento já cadastrada na política");
    }
    this.registrarAlteracao(
      "formasPagamento",
      `${this.props.formasPagamento.length} regra(s)`,
      `adicionada ${regra.forma}`,
      dados,
    );
    this.props.formasPagamento.push({ ...regra });
    this.atualizarData();
  }

  removerRegraFormaPagamento(
    forma: FormaPagamentoComercial,
    dados?: DadosAlteracaoComercial,
  ): void {
    const regraEncontrada = this.props.formasPagamento.find(
      (regra) => regra.forma === forma,
    );
    if (!regraEncontrada) {
      throw new ComercialError("forma de pagamento não encontrada na política");
    }
    if (this.props.formasPagamento.length === 1) {
      throw new ComercialError(
        "política comercial precisa ter ao menos uma forma de pagamento",
      );
    }
    this.registrarAlteracao(
      "formasPagamento",
      `${this.props.formasPagamento.length} regra(s)`,
      `removida ${forma}`,
      dados,
    );
    this.props.formasPagamento = this.props.formasPagamento.filter(
      (regra) => regra.forma !== forma,
    );
    this.atualizarData();
  }

  buscarRegraFormaPagamento(
    forma: FormaPagamentoComercial,
  ): RegraFormaPagamento | undefined {
    const regra = this.props.formasPagamento.find(
      (item) => item.forma === forma,
    );
    // Retorna cópia para evitar alteração externa da regra interna.
    return regra ? { ...regra } : undefined;
  }

  permiteFormaPagamento(forma: FormaPagamentoComercial): boolean {
    const regra = this.props.formasPagamento.find(
      (item) => item.forma === forma,
    );
    return regra?.ativa === true;
  }

  validarCondicao(condicao: CondicaoComercial, totalOrcamento: number): void {
    if (this.props.status !== "ATIVA") {
      throw new ComercialError("política comercial inativa não pode validar condição");
    }
    if (totalOrcamento < 0) {
      throw new ComercialError("total do orçamento não pode ser negativo");
    }

    const regra = this.props.formasPagamento.find(
      (item) => item.forma === condicao.formaPagamento,
    );
    if (!regra || !regra.ativa) {
      throw new ComercialError("forma de pagamento não permitida pela política");
    }

    if (condicao.quantidadeParcelas <= 0) {
      throw new ComercialError("quantidade de parcelas deve ser maior que zero");
    }
    if (condicao.quantidadeParcelas > regra.quantidadeMaximaParcelas) {
      throw new ComercialError("quantidade de parcelas maior que o permitido");
    }
    if (!regra.permiteParcelamento && condicao.quantidadeParcelas > 1) {
      throw new ComercialError("forma de pagamento não permite parcelamento");
    }

    if (
      condicao.tipoDesconto === "PERCENTUAL" &&
      condicao.valorDesconto !== null &&
      condicao.valorDesconto !== undefined &&
      condicao.valorDesconto > this.props.descontoMaximoPercentual
    ) {
      throw new ComercialError("desconto percentual maior que o permitido");
    }
    if (
      condicao.tipoDesconto === "VALOR" &&
      condicao.valorDesconto !== null &&
      condicao.valorDesconto !== undefined &&
      this.props.descontoMaximoValor !== null &&
      this.props.descontoMaximoValor !== undefined &&
      condicao.valorDesconto > this.props.descontoMaximoValor
    ) {
      throw new ComercialError("desconto em valor maior que o permitido");
    }

    if (regra.exigeSinal) {
      const percentualMinimo = regra.percentualMinimoSinal ?? 0;
      const valorMinimoSinal = totalOrcamento * (percentualMinimo / 100);
      if ((condicao.valorSinal ?? 0) < valorMinimoSinal) {
        throw new ComercialError("valor de sinal menor que o mínimo exigido");
      }
    }

    if (condicao.repassarTaxaMaquininha && !regra.repassarTaxaMaquininha) {
      throw new ComercialError("política comercial não permite repassar taxa de maquininha");
    }
    if (
      condicao.taxaMaquininhaPercentual !== null &&
      condicao.taxaMaquininhaPercentual !== undefined &&
      regra.taxaMaquininhaPercentual !== null &&
      regra.taxaMaquininhaPercentual !== undefined &&
      condicao.taxaMaquininhaPercentual > regra.taxaMaquininhaPercentual
    ) {
      throw new ComercialError("taxa de maquininha maior que a permitida pela política");
    }
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

  private atualizarData(): void {
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

  get status(): PoliticaComercialProps["status"] {
    return this.props.status;
  }

  get descontoMaximoPercentual(): number {
    return this.props.descontoMaximoPercentual;
  }

  get descontoMaximoValor(): number | null | undefined {
    return this.props.descontoMaximoValor;
  }

  get prazoValidadeDias(): number {
    return this.props.prazoValidadeDias;
  }

  get formasPagamento(): RegraFormaPagamento[] {
    return this.props.formasPagamento.map((regra) => ({ ...regra }));
  }

  get jurosAtrasoPercentualMes(): number | null | undefined {
    return this.props.jurosAtrasoPercentualMes;
  }

  get multaAtrasoPercentual(): number | null | undefined {
    return this.props.multaAtrasoPercentual;
  }

  get permiteNegociacaoManual(): boolean {
    return this.props.permiteNegociacaoManual;
  }

  get exigeAprovacaoAcimaDoDescontoMaximo(): boolean {
    return this.props.exigeAprovacaoAcimaDoDescontoMaximo;
  }

  get alteracoes(): RegistroAlteracaoComercial[] {
    return this.props.alteracoes.map((alteracao) => ({ ...alteracao }));
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
