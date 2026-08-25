import { randomUUID } from "crypto";
import {
  CondicaoComercialProps,
  CriarCondicaoComercialProps,
} from "./CondicaoComercialProps";
import {
  DadosAlteracaoComercial,
  FormaPagamentoComercial,
  RegistroAlteracaoComercial,
  TipoDesconto,
} from "./comercial_types";
import { ComercialError } from "./ComercialError";

// CondicaoComercial — acordo específico aplicado em uma negociação.
// A política define o limite; a condição aplica o acordo naquele orçamento.
export class CondicaoComercial {
  private constructor(private readonly props: CondicaoComercialProps) {}

  static criar(props: CriarCondicaoComercialProps): CondicaoComercial {
    CondicaoComercial.validarCriacao(props);

    return new CondicaoComercial({
      id: randomUUID(),
      negocioId: props.negocioId.trim(),
      politicaComercialId: props.politicaComercialId?.trim() || null,
      formaPagamento: props.formaPagamento,
      // Se não informar parcelas, assume 1.
      quantidadeParcelas: props.quantidadeParcelas ?? 1,
      tipoDesconto: props.tipoDesconto ?? null,
      valorDesconto: props.valorDesconto ?? null,
      valorSinal: props.valorSinal ?? null,
      // Por padrão, não repassa taxa de maquininha.
      repassarTaxaMaquininha: props.repassarTaxaMaquininha ?? false,
      taxaMaquininhaPercentual: props.taxaMaquininhaPercentual ?? null,
      jurosAtrasoPercentualMes: props.jurosAtrasoPercentualMes ?? null,
      multaAtrasoPercentual: props.multaAtrasoPercentual ?? null,
      validadeAte: props.validadeAte ?? null,
      observacao: props.observacao?.trim() || null,
      status: "ATIVA",
      // Histórico começa vazio na criação.
      alteracoes: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  private static validarCriacao(props: CriarCondicaoComercialProps): void {
    if (!props.negocioId || !props.negocioId.trim()) {
      throw new ComercialError("negocioId é obrigatório");
    }
    if (!props.formaPagamento) {
      throw new ComercialError("forma de pagamento é obrigatória");
    }
    const quantidadeParcelas = props.quantidadeParcelas ?? 1;
    if (quantidadeParcelas <= 0) {
      throw new ComercialError("quantidade de parcelas deve ser maior que zero");
    }
    CondicaoComercial.validarDesconto(
      props.tipoDesconto ?? null,
      props.valorDesconto ?? null,
    );
    CondicaoComercial.validarNumeroNaoNegativo(
      props.valorSinal,
      "valor de sinal não pode ser negativo",
    );
    CondicaoComercial.validarNumeroNaoNegativo(
      props.taxaMaquininhaPercentual,
      "taxa de maquininha não pode ser negativa",
    );
    CondicaoComercial.validarNumeroNaoNegativo(
      props.jurosAtrasoPercentualMes,
      "juros por atraso não pode ser negativo",
    );
    CondicaoComercial.validarNumeroNaoNegativo(
      props.multaAtrasoPercentual,
      "multa por atraso não pode ser negativa",
    );
  }

  private static validarDesconto(
    tipoDesconto?: TipoDesconto | null,
    valorDesconto?: number | null,
  ): void {
    if (valorDesconto === undefined || valorDesconto === null) {
      return;
    }
    if (valorDesconto < 0) {
      throw new ComercialError("valor de desconto não pode ser negativo");
    }
    if (tipoDesconto === "PERCENTUAL" && valorDesconto > 100) {
      throw new ComercialError("desconto percentual não pode ser maior que 100");
    }
    if (!tipoDesconto) {
      throw new ComercialError(
        "tipo de desconto é obrigatório quando valor de desconto é informado",
      );
    }
  }

  private static validarNumeroNaoNegativo(
    valor: number | null | undefined,
    mensagem: string,
  ): void {
    if (valor !== undefined && valor !== null && valor < 0) {
      throw new ComercialError(mensagem);
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

  alterarFormaPagamento(
    formaPagamento: FormaPagamentoComercial,
    quantidadeParcelas: number,
    dados?: DadosAlteracaoComercial,
  ): void {
    if (!formaPagamento) {
      throw new ComercialError("forma de pagamento é obrigatória");
    }
    if (quantidadeParcelas <= 0) {
      throw new ComercialError("quantidade de parcelas deve ser maior que zero");
    }

    let alterou = false;

    if (this.props.formaPagamento !== formaPagamento) {
      this.registrarAlteracao(
        "formaPagamento",
        this.props.formaPagamento,
        formaPagamento,
        dados,
      );
      this.props.formaPagamento = formaPagamento;
      alterou = true;
    }

    if (this.props.quantidadeParcelas !== quantidadeParcelas) {
      this.registrarAlteracao(
        "quantidadeParcelas",
        this.props.quantidadeParcelas,
        quantidadeParcelas,
        dados,
      );
      this.props.quantidadeParcelas = quantidadeParcelas;
      alterou = true;
    }

    if (alterou) {
      this.atualizarData();
    }
  }

  alterarDesconto(
    tipoDesconto?: TipoDesconto | null,
    valorDesconto?: number | null,
    dados?: DadosAlteracaoComercial,
  ): void {
    const novoTipoDesconto = tipoDesconto ?? null;
    const novoValorDesconto = valorDesconto ?? null;

    CondicaoComercial.validarDesconto(novoTipoDesconto, novoValorDesconto);

    const descontoAtual = this.formatarDesconto(
      this.props.tipoDesconto,
      this.props.valorDesconto,
    );
    const descontoNovo = this.formatarDesconto(
      novoTipoDesconto,
      novoValorDesconto,
    );

    if (descontoAtual === descontoNovo) {
      return;
    }

    this.registrarAlteracao("desconto", descontoAtual, descontoNovo, dados);
    this.props.tipoDesconto = novoTipoDesconto;
    this.props.valorDesconto = novoValorDesconto;
    this.atualizarData();
  }

  alterarSinal(
    valorSinal?: number | null,
    dados?: DadosAlteracaoComercial,
  ): void {
    const novoValorSinal = valorSinal ?? null;

    CondicaoComercial.validarNumeroNaoNegativo(
      novoValorSinal,
      "valor de sinal não pode ser negativo",
    );

    if (this.props.valorSinal === novoValorSinal) {
      return;
    }

    this.registrarAlteracao(
      "valorSinal",
      this.props.valorSinal,
      novoValorSinal,
      dados,
    );
    this.props.valorSinal = novoValorSinal;
    this.atualizarData();
  }

  alterarTaxaMaquininha(
    repassar: boolean,
    taxaPercentual?: number | null,
    dados?: DadosAlteracaoComercial,
  ): void {
    const novaTaxa = taxaPercentual ?? null;

    CondicaoComercial.validarNumeroNaoNegativo(
      novaTaxa,
      "taxa de maquininha não pode ser negativa",
    );

    let alterou = false;

    if (this.props.repassarTaxaMaquininha !== repassar) {
      this.registrarAlteracao(
        "repassarTaxaMaquininha",
        this.props.repassarTaxaMaquininha,
        repassar,
        dados,
      );
      this.props.repassarTaxaMaquininha = repassar;
      alterou = true;
    }

    if (this.props.taxaMaquininhaPercentual !== novaTaxa) {
      this.registrarAlteracao(
        "taxaMaquininhaPercentual",
        this.props.taxaMaquininhaPercentual,
        novaTaxa,
        dados,
      );
      this.props.taxaMaquininhaPercentual = novaTaxa;
      alterou = true;
    }

    if (alterou) {
      this.atualizarData();
    }
  }

  alterarValidade(
    validadeAte?: Date | null,
    dados?: DadosAlteracaoComercial,
  ): void {
    const validadeAtualTime = this.props.validadeAte?.getTime() ?? null;
    const novaValidadeTime = validadeAte?.getTime() ?? null;

    if (validadeAtualTime === novaValidadeTime) {
      return;
    }

    this.registrarAlteracao(
      "validadeAte",
      this.formatarData(this.props.validadeAte),
      this.formatarData(validadeAte),
      dados,
    );
    this.props.validadeAte = validadeAte ?? null;
    this.atualizarData();
  }

  alterarObservacao(
    observacao?: string | null,
    dados?: DadosAlteracaoComercial,
  ): void {
    const novaObservacao = observacao?.trim() || null;

    if (this.props.observacao === novaObservacao) {
      return;
    }

    this.registrarAlteracao(
      "observacao",
      this.props.observacao,
      novaObservacao,
      dados,
    );
    this.props.observacao = novaObservacao;
    this.atualizarData();
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

  private formatarDesconto(
    tipoDesconto?: TipoDesconto | null,
    valorDesconto?: number | null,
  ): string {
    if (!tipoDesconto || valorDesconto === null || valorDesconto === undefined) {
      return "";
    }
    return `${tipoDesconto} ${valorDesconto}`;
  }

  private formatarData(data?: Date | null): string {
    return data ? data.toISOString() : "";
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get politicaComercialId(): string | null | undefined {
    return this.props.politicaComercialId;
  }

  get formaPagamento(): FormaPagamentoComercial {
    return this.props.formaPagamento;
  }

  get quantidadeParcelas(): number {
    return this.props.quantidadeParcelas;
  }

  get tipoDesconto(): TipoDesconto | null | undefined {
    return this.props.tipoDesconto;
  }

  get valorDesconto(): number | null | undefined {
    return this.props.valorDesconto;
  }

  get valorSinal(): number | null | undefined {
    return this.props.valorSinal;
  }

  get repassarTaxaMaquininha(): boolean {
    return this.props.repassarTaxaMaquininha;
  }

  get taxaMaquininhaPercentual(): number | null | undefined {
    return this.props.taxaMaquininhaPercentual;
  }

  get jurosAtrasoPercentualMes(): number | null | undefined {
    return this.props.jurosAtrasoPercentualMes;
  }

  get multaAtrasoPercentual(): number | null | undefined {
    return this.props.multaAtrasoPercentual;
  }

  get validadeAte(): Date | null | undefined {
    return this.props.validadeAte;
  }

  get observacao(): string | null | undefined {
    return this.props.observacao;
  }

  get status(): CondicaoComercialProps["status"] {
    return this.props.status;
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
