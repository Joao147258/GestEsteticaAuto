import { randomUUID } from "crypto";
import { VeiculoError } from "./VeiculoError";
import { VeiculoProps, CriarVeiculoProps, DadosAtualizacaoVeiculo } from "./VeiculoProps";

// Veiculo do cliente — dados principais do automóvel.
// Sem histórico de proprietário e sem validação real de placa nesta etapa.
// Orçamento e ordem de serviço o referenciam por veiculoId.
export class Veiculo {
  private constructor(private readonly props: VeiculoProps) {}

  // Obrigatórios: clienteId, marca e modelo. Decisões: quilometragem não pode
  // ser negativa; placa/ano/cor/chassi/renavam são opcionais e viram null
  // quando vazios; status inicial ATIVO; histórico de alterações começa vazio.
  static criar(props: CriarVeiculoProps): Veiculo {
    const marca = props.marca?.trim();
    const modelo = props.modelo?.trim();
    if (!props.clienteId) {
      throw new VeiculoError("Cliente é obrigatório");
    }
    if (!marca) {
      throw new VeiculoError("Marca é obrigatória");
    }
    if (!modelo) {
      throw new VeiculoError("Modelo é obrigatório");
    }
    if (props.quilometragem !== undefined && props.quilometragem !== null && props.quilometragem < 0) {
      throw new VeiculoError("Quilometragem não pode ser negativa");
    }

    return new Veiculo({
      id: randomUUID(),
      negocioId: props.negocioId,
      clienteId: props.clienteId,
      placa: props.placa?.trim() || null,
      marca,
      modelo,
      anoFabricacao: props.anoFabricacao ?? null,
      anoModelo: props.anoModelo ?? null,
      cor: props.cor?.trim() || null,
      chassi: props.chassi?.trim() || null,
      renavam: props.renavam?.trim() || null,
      quilometragem: props.quilometragem ?? null,
      observacoes: props.observacoes?.trim() || null,
      status: "ATIVO",
      // O histórico começa vazio: ainda não houve alteração.
      alteracoes: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }

  // Reconstitui a entidade a partir de dados já persistidos (sem revalidar).
  // Padrão do domínio (ver ItemOrcamento.reconstituir); usado pelos mappers
  // da Infrastructure ao carregar um veículo do banco. Não gera novo id.
  static reconstituir(props: VeiculoProps): Veiculo {
    return new Veiculo(props);
  }

  // Padrão dos métodos de alteração: normalizar (trim) → validar o obrigatório
  // → registrar no histórico → alterar o estado → atualizar atualizadoEm.
  alterarPlaca(placa: string | null): void {
    const placaNormalizada = placa?.trim() || null;

    this.registrarAlteracao(
      "placa",
      this.props.placa,
      placaNormalizada,
      "Placa do veículo alterada",
    );

    this.props.placa = placaNormalizada;
    this.props.atualizadoEm = new Date();
  }

  alterarMarca(marca: string): void {
    const marcaNormalizada = marca.trim();
    if (!marcaNormalizada) {
      throw new VeiculoError("Marca é obrigatória");
    }

    this.registrarAlteracao(
      "marca",
      this.props.marca,
      marcaNormalizada,
      "Marca do veículo alterada",
    );

    this.props.marca = marcaNormalizada;
    this.props.atualizadoEm = new Date();
  }

  alterarModelo(modelo: string): void {
    const modeloNormalizado = modelo.trim();
    if (!modeloNormalizado) {
      throw new VeiculoError("Modelo é obrigatório");
    }

    this.registrarAlteracao(
      "modelo",
      this.props.modelo,
      modeloNormalizado,
      "Modelo do veículo alterado",
    );

    this.props.modelo = modeloNormalizado;
    this.props.atualizadoEm = new Date();
  }

  alterarAnoFabricacao(ano: number): void {
    this.registrarAlteracao(
      "anoFabricacao",
      this.props.anoFabricacao,
      ano,
      "Ano de fabricação do veículo alterado",
    );

    this.props.anoFabricacao = ano;
    this.props.atualizadoEm = new Date();
  }

  alterarAnoModelo(ano: number): void {
    this.registrarAlteracao(
      "anoModelo",
      this.props.anoModelo,
      ano,
      "Ano do modelo alterado",
    );

    this.props.anoModelo = ano;
    this.props.atualizadoEm = new Date();
  }

  alterarCor(cor: string | null): void {
    const corNormalizada = cor?.trim() || null;

    this.registrarAlteracao(
      "cor",
      this.props.cor,
      corNormalizada,
      "Cor do veículo alterada",
    );

    this.props.cor = corNormalizada;
    this.props.atualizadoEm = new Date();
  }

  alterarKm(quilometragem: number): void {
    if (quilometragem < 0) {
      throw new VeiculoError("Quilometragem não pode ser negativa");
    }

    this.registrarAlteracao(
      "quilometragem",
      this.props.quilometragem,
      quilometragem,
      "Quilometragem do veículo alterada",
    );

    this.props.quilometragem = quilometragem;
    this.props.atualizadoEm = new Date();
  }

  alterarObservacoes(observacoes: string | null): void {
    const observacoesNormalizadas = observacoes?.trim() || null;

    this.registrarAlteracao(
      "observacoes",
      this.props.observacoes,
      observacoesNormalizadas,
      "Observações do veículo alteradas",
    );

    this.props.observacoes = observacoesNormalizadas;
    this.props.atualizadoEm = new Date();
  }

  // Atualização em lote de dados cadastrais simples: delega a cada método
  // específico existente (cada um com sua validação e histórico). Não inclui
  // clienteId — trocar o dono é ação específica via vincularCliente.
  // undefined preserva o valor atual; null limpa o campo (quando suportado).
  atualizarDados(dados: DadosAtualizacaoVeiculo): void {
    if (dados.placa !== undefined) {
      this.alterarPlaca(dados.placa);
    }
    if (dados.marca !== undefined) {
      this.alterarMarca(dados.marca);
    }
    if (dados.modelo !== undefined) {
      this.alterarModelo(dados.modelo);
    }
    if (dados.anoFabricacao !== undefined) {
      this.alterarAnoFabricacao(dados.anoFabricacao);
    }
    if (dados.anoModelo !== undefined) {
      this.alterarAnoModelo(dados.anoModelo);
    }
    if (dados.cor !== undefined) {
      this.alterarCor(dados.cor);
    }
    if (dados.quilometragem !== undefined) {
      this.alterarKm(dados.quilometragem);
    }
    if (dados.observacoes !== undefined) {
      this.alterarObservacoes(dados.observacoes);
    }
  }

  // Vincula o veículo a outro cliente — decisão: o veículo não é deletado nem
  // duplicado ao trocar de dono; apenas o clienteId muda com registro.
  vincularCliente(clienteId: string): void {
    const clienteNormalizado = clienteId.trim();
    if (!clienteNormalizado) {
      throw new VeiculoError("Cliente é obrigatório");
    }

    this.registrarAlteracao(
      "clienteId",
      this.props.clienteId,
      clienteNormalizado,
      "Cliente do veículo alterado",
    );

    this.props.clienteId = clienteNormalizado;
    this.props.atualizadoEm = new Date();
  }

  // Ativar/inativar são idempotentes (status igual → no-op) e nunca apagam o
  // veículo — histórico de OS/orçamento o referencia por veiculoId.
  ativar(): void {
    if (this.props.status === "ATIVO") {
      return;
    }

    this.registrarAlteracao(
      "status",
      this.props.status,
      "ATIVO",
      "Veículo ativado",
    );

    this.props.status = "ATIVO";
    this.props.atualizadoEm = new Date();
  }

  inativar(): void {
    if (this.props.status === "INATIVO") {
      return;
    }

    this.registrarAlteracao(
      "status",
      this.props.status,
      "INATIVO",
      "Veículo inativado",
    );

    this.props.status = "INATIVO";
    this.props.atualizadoEm = new Date();
  }

  // Registra uma alteração no histórico interno do veículo.
  // Não registra quando o valor não muda; normaliza undefined para null.
  private registrarAlteracao(
    campo: string,
    valorAnterior: string | number | null | undefined,
    valorNovo: string | number | null | undefined,
    descricao?: string | null,
    alteradoPor?: string | null,
  ): void {
    const anterior = valorAnterior ?? null;
    const novo = valorNovo ?? null;

    if (anterior === novo) {
      return;
    }

    this.props.alteracoes.push({
      campo,
      valorAnterior: anterior,
      valorNovo: novo,
      alteradoEm: new Date(),
      descricao: descricao ?? null,
      alteradoPor: alteradoPor ?? null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get negocioId(): string {
    return this.props.negocioId;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get placa(): string | null | undefined {
    return this.props.placa;
  }

  get marca(): string | null | undefined {
    return this.props.marca;
  }

  get modelo(): string | null | undefined {
    return this.props.modelo;
  }

  get anoFabricacao(): number | null | undefined {
    return this.props.anoFabricacao;
  }

  get anoModelo(): number | null | undefined {
    return this.props.anoModelo;
  }

  get cor(): string | null | undefined {
    return this.props.cor;
  }

  get chassi(): string | null | undefined {
    return this.props.chassi;
  }

  get renavam(): string | null | undefined {
    return this.props.renavam;
  }

  get quilometragem(): number | null | undefined {
    return this.props.quilometragem;
  }

  get observacoes(): string | null | undefined {
    return this.props.observacoes;
  }

  get status(): VeiculoProps["status"] {
    return this.props.status;
  }

  // Devolve uma cópia da lista para impedir alteração externa direta.
  get alteracoes(): VeiculoProps["alteracoes"] {
    return [...this.props.alteracoes];
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
