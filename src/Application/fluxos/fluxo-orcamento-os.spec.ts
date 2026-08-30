// Fluxo completo orçamento → OS — teste de integração da Application com
// repositórios em memória (sem banco, sem Prisma, sem HTTP/Controller).
//
// Simula o fluxo principal da V1 (painel administrativo):
//   cliente → veículo → serviço → orçamento (origem PAINEL, itens) → abrir →
//   aprovar → converter em OS → iniciar → concluir → entregar.
//
// Mapeamento de nomes (o projeto usa nomes próprios, equivalentes aos nomes
// de referência A_FAZER/EM_PRODUCAO/FINALIZADO/ENTREGUE):
//   A_FAZER      → ABERTA       (status inicial da OS)
//   EM_PRODUCAO  → EM_EXECUCAO  (OrdemServico.iniciar())
//   FINALIZADO   → CONCLUIDA    (OrdemServico.concluir())
//   ENTREGUE     → ENTREGUE     (OrdemServico.entregar())
//
// Observação: transição de item da OS (iniciarItem/concluirItem) ainda não tem
// use case próprio na Application — o teste executa direto no domínio e
// persiste, simulando o elo futuro (ver pendência no relatório).
import {
  Cliente,
  Orcamento,
  OrdemServico,
  Servico,
  StatusOrdemServico,
  Veiculo,
} from "../../Domain";
import { ComercialError } from "../../Domain/comercial";
import { OperacaoError } from "../../Domain/operacao";
import { ClientesRepository } from "../clientes/repositories/clientes.repository";
import { CriarClienteUseCase } from "../clientes/use-cases/criar-cliente.use-case";
import { ServicosRepository } from "../catalogo/repositories/servicos.repository";
import { CriarServicoUseCase } from "../catalogo/use-cases/criar-servico.use-case";
import { OrcamentosRepository } from "../comercial/repositories/OrcamentosRepository";
import { AbrirOrcamentoUseCase } from "../comercial/usecases/AbrirOrcamentoUseCase";
import { AdicionarItemOrcamentoUseCase } from "../comercial/usecases/AdicionarItemOrcamentoUseCase";
import { AprovarOrcamentoUseCase } from "../comercial/usecases/AprovarOrcamentoUseCase";
import { CriarOrcamentoUseCase } from "../comercial/usecases/CriarOrcamentoUseCase";
import { OrcamentoNaoAprovadoError } from "../operacao/errors/OrcamentoNaoAprovadoError";
import { OrdensServicoRepository } from "../operacao/repositories/ordens-servico.repository";
import { AtualizarOrdemServicoUseCase } from "../operacao/use-cases/atualizar-ordem-servico.use-case";
import { CancelarOrdemServicoUseCase } from "../operacao/use-cases/cancelar-ordem-servico.use-case";
import { ConcluirOrdemServicoUseCase } from "../operacao/use-cases/concluir-ordem-servico.use-case";
import { EntregarOrdemServicoUseCase } from "../operacao/use-cases/entregar-ordem-servico.use-case";
import { GerarOrdemServicoUseCase } from "../operacao/use-cases/gerar-ordem-servico.use-case";
import { IniciarOrdemServicoUseCase } from "../operacao/use-cases/iniciar-ordem-servico.use-case";
import { PausarOrdemServicoUseCase } from "../operacao/use-cases/pausar-ordem-servico.use-case";
import { VeiculosRepository } from "../veiculos/repositories/veiculos.repository";
import { CriarVeiculoUseCase } from "../veiculos/use-cases/criar-veiculo.use-case";

// ----- Repositórios em memória (implementação fiel dos contratos) -----

class ClientesEmMemoria implements ClientesRepository {
  private mapa = new Map<string, Cliente>();

  private chave(negocioId: string, id: string): string {
    return `${negocioId}:${id}`;
  }

  async salvar(cliente: Cliente): Promise<void> {
    this.mapa.set(this.chave(cliente.negocioId, cliente.id), cliente);
  }

  async buscarPorId(
    negocioId: string,
    clienteId: string,
  ): Promise<Cliente | null> {
    return this.mapa.get(this.chave(negocioId, clienteId)) ?? null;
  }

  async buscarPorDocumento(
    negocioId: string,
    documento: string,
  ): Promise<Cliente | null> {
    return (
      [...this.mapa.values()].find(
        (c) => c.negocioId === negocioId && c.documento === documento,
      ) ?? null
    );
  }

  async listarPorNegocio(params: {
    negocioId: string;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Cliente[]> {
    return [...this.mapa.values()].filter(
      (c) => c.negocioId === params.negocioId,
    );
  }

  async remover(negocioId: string, clienteId: string): Promise<void> {
    this.mapa.delete(this.chave(negocioId, clienteId));
  }
}

class VeiculosEmMemoria implements VeiculosRepository {
  private mapa = new Map<string, Veiculo>();

  private chave(negocioId: string, id: string): string {
    return `${negocioId}:${id}`;
  }

  async salvar(veiculo: Veiculo): Promise<void> {
    this.mapa.set(this.chave(veiculo.negocioId, veiculo.id), veiculo);
  }

  async buscarPorId(
    negocioId: string,
    veiculoId: string,
  ): Promise<Veiculo | null> {
    return this.mapa.get(this.chave(negocioId, veiculoId)) ?? null;
  }

  async buscarPorPlaca(
    negocioId: string,
    placa: string,
  ): Promise<Veiculo | null> {
    return (
      [...this.mapa.values()].find(
        (v) => v.negocioId === negocioId && v.placa === placa,
      ) ?? null
    );
  }

  async listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Veiculo[]> {
    return [...this.mapa.values()].filter(
      (v) =>
        v.negocioId === params.negocioId &&
        (params.clienteId ? v.clienteId === params.clienteId : true),
    );
  }

  async remover(negocioId: string, veiculoId: string): Promise<void> {
    this.mapa.delete(this.chave(negocioId, veiculoId));
  }
}

class ServicosEmMemoria implements ServicosRepository {
  private mapa = new Map<string, Servico>();

  private chave(negocioId: string, id: string): string {
    return `${negocioId}:${id}`;
  }

  async salvar(servico: Servico): Promise<void> {
    this.mapa.set(this.chave(servico.negocioId, servico.id), servico);
  }

  async buscarPorId(
    negocioId: string,
    servicoId: string,
  ): Promise<Servico | null> {
    return this.mapa.get(this.chave(negocioId, servicoId)) ?? null;
  }

  async buscarPorNome(
    negocioId: string,
    nome: string,
  ): Promise<Servico | null> {
    return (
      [...this.mapa.values()].find(
        (s) => s.negocioId === negocioId && s.nome === nome,
      ) ?? null
    );
  }

  async listarPorNegocio(params: {
    negocioId: string;
    busca?: string;
    pagina?: number;
    limite?: number;
    ativo?: boolean;
  }): Promise<Servico[]> {
    return [...this.mapa.values()].filter(
      (s) => s.negocioId === params.negocioId,
    );
  }
}

class OrcamentosEmMemoria implements OrcamentosRepository {
  private mapa = new Map<string, Orcamento>();

  private chave(negocioId: string, id: string): string {
    return `${negocioId}:${id}`;
  }

  async salvar(orcamento: Orcamento): Promise<void> {
    this.mapa.set(this.chave(orcamento.negocioId, orcamento.id), orcamento);
  }

  async buscarPorId(
    negocioId: string,
    orcamentoId: string,
  ): Promise<Orcamento | null> {
    return this.mapa.get(this.chave(negocioId, orcamentoId)) ?? null;
  }

  async listarPorNegocio(params: {
    negocioId: string;
    clienteId?: string;
    veiculoId?: string;
    origem?: Orcamento["origem"];
    status?: Orcamento["status"];
    dataInicio?: Date;
    dataFim?: Date;
    busca?: string;
    pagina?: number;
    limite?: number;
  }): Promise<Orcamento[]> {
    return [...this.mapa.values()].filter(
      (o) => o.negocioId === params.negocioId,
    );
  }

  async remover(negocioId: string, orcamentoId: string): Promise<void> {
    this.mapa.delete(this.chave(negocioId, orcamentoId));
  }
}

class OrdensServicoEmMemoria implements OrdensServicoRepository {
  private mapa = new Map<string, OrdemServico>();

  private chave(negocioId: string, id: string): string {
    return `${negocioId}:${id}`;
  }

  async salvar(ordemServico: OrdemServico): Promise<void> {
    this.mapa.set(this.chave(ordemServico.negocioId, ordemServico.id), ordemServico);
  }

  async buscarPorId(
    negocioId: string,
    ordemServicoId: string,
  ): Promise<OrdemServico | null> {
    return this.mapa.get(this.chave(negocioId, ordemServicoId)) ?? null;
  }

  async buscarPorOrcamento(
    negocioId: string,
    orcamentoId: string,
  ): Promise<OrdemServico | null> {
    return (
      [...this.mapa.values()].find(
        (os) => os.negocioId === negocioId && os.orcamentoId === orcamentoId,
      ) ?? null
    );
  }

  async listarPorNegocio(params: {
    negocioId: string;
    status?: StatusOrdemServico;
    clienteId?: string;
    veiculoId?: string;
    orcamentoId?: string;
    busca?: string;
    pagina?: number;
    limite?: number;
    dataInicio?: Date;
    dataFim?: Date;
  }): Promise<OrdemServico[]> {
    return [...this.mapa.values()].filter(
      (os) => os.negocioId === params.negocioId,
    );
  }
}

// ----- Fluxo integrado -----

describe("Fluxo completo orçamento → OS (Application em memória)", () => {
  const NEGOCIO = "neg-1";

  let clientesRepo: ClientesEmMemoria;
  let veiculosRepo: VeiculosEmMemoria;
  let servicosRepo: ServicosEmMemoria;
  let orcamentosRepo: OrcamentosEmMemoria;
  let ordensRepo: OrdensServicoEmMemoria;

  beforeEach(() => {
    clientesRepo = new ClientesEmMemoria();
    veiculosRepo = new VeiculosEmMemoria();
    servicosRepo = new ServicosEmMemoria();
    orcamentosRepo = new OrcamentosEmMemoria();
    ordensRepo = new OrdensServicoEmMemoria();
  });

  async function montarCenario(rotulo = "") {
    const cliente = await new CriarClienteUseCase(clientesRepo).execute({
      negocioId: NEGOCIO,
      nome: "João Silva",
      tipo: "PESSOA_FISICA",
      documento: `123.456.789-00${rotulo}`,
    });

    const veiculo = await new CriarVeiculoUseCase(
      veiculosRepo,
      clientesRepo,
    ).execute({
      negocioId: NEGOCIO,
      clienteId: cliente.id,
      marca: "Honda",
      modelo: "Civic",
      placa: `HND-2020${rotulo}`,
    });

    const servico = await new CriarServicoUseCase(servicosRepo).execute({
      negocioId: NEGOCIO,
      nome: `Lavagem detalhada${rotulo}`,
      precoBase: 120,
    });

    return { cliente, veiculo, servico };
  }

  // Cria um orçamento ACEITO e converte em OS (status ABERTA) — ponto de
  // partida dos testes de transição da OS.
  async function montarOsAberta(rotulo = "") {
    const { cliente, veiculo, servico } = await montarCenario(rotulo);

    const criado = await new CriarOrcamentoUseCase(
      orcamentosRepo,
      clientesRepo,
      servicosRepo,
    ).executar({
      negocioId: NEGOCIO,
      clienteId: cliente.id,
      veiculoId: veiculo.id,
      itens: [{ servicoId: servico.id, quantidade: 1, valorUnitario: 120 }],
    });
    await new AbrirOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    await new AprovarOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });

    const gerarOs = new GerarOrdemServicoUseCase(ordensRepo, orcamentosRepo);
    const os = await gerarOs.execute({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    return { criado, os, gerarOs };
  }

  // Leva uma OS até ENTREGUE (ABERTA → EM_EXECUCAO → CONCLUIDA → ENTREGUE).
  async function montarOsEntregue() {
    const { os } = await montarOsAberta();
    await new IniciarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: os.id,
    });
    for (const item of os.itens) {
      os.iniciarItem(item.id);
      os.concluirItem(item.id);
    }
    await ordensRepo.salvar(os);
    await new ConcluirOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: os.id,
    });
    await new EntregarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: os.id,
    });
    return os;
  }

  it("percorre o fluxo principal: cliente → veículo → serviço → orçamento → aprovar → OS → concluir → entregar", async () => {
    const { cliente, veiculo, servico } = await montarCenario();

    // 1. Criar orçamento manual pelo painel, com um item na criação.
    const criado = await new CriarOrcamentoUseCase(
      orcamentosRepo,
      clientesRepo,
      servicosRepo,
    ).executar({
      negocioId: NEGOCIO,
      clienteId: cliente.id,
      veiculoId: veiculo.id,
      itens: [{ servicoId: servico.id, quantidade: 1, valorUnitario: 120 }],
    });
    expect(criado.status).toBe("RASCUNHO");
    expect(criado.itens).toHaveLength(1);
    // 1b. Orçamento criado pelo painel nasce com origem PAINEL (padrão).
    expect(criado.origem).toBe("PAINEL");

    // 2. Adicionar item/serviço ao orçamento (mesmo serviço, valor negociado).
    const comItemExtra = await new AdicionarItemOrcamentoUseCase(
      orcamentosRepo,
      servicosRepo,
    ).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
      servicoId: servico.id,
      quantidade: 1,
      valorUnitario: 150,
    });
    expect(comItemExtra.itens).toHaveLength(2);

    // 3. Abrir o orçamento (RASCUNHO → EM_ABERTO).
    const aberto = await new AbrirOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    expect(aberto.status).toBe("EM_ABERTO");

    // 4. Aprovar o orçamento (EM_ABERTO → ACEITO).
    const aprovado = await new AprovarOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    expect(aprovado.status).toBe("ACEITO");

    // 5. Converter orçamento aprovado em OS.
    const gerarOs = new GerarOrdemServicoUseCase(ordensRepo, orcamentosRepo);
    const os = await gerarOs.execute({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });

    // 6. Status inicial da OS = ABERTA (equivalente a A_FAZER).
    expect(os.status).toBe("ABERTA");
    // 7. Vínculo orçamento → OS e cópia de cliente/veículo/itens.
    expect(os.orcamentoId).toBe(criado.id);
    expect(os.clienteId).toBe(cliente.id);
    expect(os.veiculoId).toBe(veiculo.id);
    expect(os.itens).toHaveLength(2);
    expect(os.itens.every((item) => item.servicoId === servico.id)).toBe(true);
    expect(os.itens.map((item) => item.descricao)).toEqual([
      "Lavagem detalhada",
      "Lavagem detalhada",
    ]);

    // 8. Iniciar execução (ABERTA → EM_EXECUCAO, equivalente a EM_PRODUCAO).
    const emExecucao = await new IniciarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: os.id,
    });
    expect(emExecucao.status).toBe("EM_EXECUCAO");

    // 9. Execução dos itens (elo ainda sem use case próprio na Application —
    //    feito direto no domínio e persistido, como faria um use case futuro).
    for (const item of os.itens) {
      os.iniciarItem(item.id);
      os.concluirItem(item.id);
    }
    await ordensRepo.salvar(os);

    // 10. Concluir a OS (EM_EXECUCAO → CONCLUIDA, equivalente a FINALIZADO).
    const concluida = await new ConcluirOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: os.id,
    });
    expect(concluida.status).toBe("CONCLUIDA");
    expect(concluida.finalizadaEm).toBeInstanceOf(Date);

    // 11. Entregar a OS ao cliente (CONCLUIDA → ENTREGUE).
    const entregue = await new EntregarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: os.id,
    });
    expect(entregue.status).toBe("ENTREGUE");
    expect(entregue.entregueEm).toBeInstanceOf(Date);

    // 12. Vínculo orçamento → OS preservado e rastreabilidade comercial.
    expect(entregue.orcamentoId).toBe(criado.id);
    const orcamentoPersistido = await orcamentosRepo.buscarPorId(
      NEGOCIO,
      criado.id,
    );
    expect(orcamentoPersistido?.status).toBe("ACEITO");
    // 13. A origem do orçamento permanece PAINEL (canal do painel).
    expect(orcamentoPersistido?.origem).toBe("PAINEL");
    const statuses = orcamentoPersistido?.alteracoes
      .filter((a) => a.campo === "status")
      .map((a) => a.valorNovo);
    expect(statuses).toEqual(["EM_ABERTO", "ACEITO"]);

    // 14. Não converte o mesmo orçamento duas vezes (idempotente: retorna a
    //     mesma OS e não cria outra).
    const osDeNovo = await gerarOs.execute({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    expect(osDeNovo.id).toBe(os.id);
    expect(await ordensRepo.listarPorNegocio({ negocioId: NEGOCIO })).toHaveLength(1);
  });

  it("não converte orçamento não aprovado em OS", async () => {
    const { cliente, veiculo, servico } = await montarCenario();

    const criado = await new CriarOrcamentoUseCase(
      orcamentosRepo,
      clientesRepo,
      servicosRepo,
    ).executar({
      negocioId: NEGOCIO,
      clienteId: cliente.id,
      veiculoId: veiculo.id,
      itens: [{ servicoId: servico.id, quantidade: 1, valorUnitario: 120 }],
    });
    // Fica EM_ABERTO (aberto mas não aprovado).
    await new AbrirOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });

    const gerarOs = new GerarOrdemServicoUseCase(ordensRepo, orcamentosRepo);
    await expect(
      gerarOs.execute({ negocioId: NEGOCIO, orcamentoId: criado.id }),
    ).rejects.toThrow(OrcamentoNaoAprovadoError);
    expect(await ordensRepo.listarPorNegocio({ negocioId: NEGOCIO })).toHaveLength(0);
  });

  it("não finaliza OS antes de entrar em produção", async () => {
    const { cliente, veiculo, servico } = await montarCenario();

    const criado = await new CriarOrcamentoUseCase(
      orcamentosRepo,
      clientesRepo,
      servicosRepo,
    ).executar({
      negocioId: NEGOCIO,
      clienteId: cliente.id,
      veiculoId: veiculo.id,
      itens: [{ servicoId: servico.id, quantidade: 1, valorUnitario: 120 }],
    });
    await new AbrirOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    await new AprovarOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });

    const gerarOs = new GerarOrdemServicoUseCase(ordensRepo, orcamentosRepo);
    const os = await gerarOs.execute({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });
    expect(os.status).toBe("ABERTA");

    // OS ainda ABERTA: concluir deve falhar (não pulou para EM_EXECUCAO).
    await expect(
      new ConcluirOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: os.id,
      }),
    ).rejects.toThrow(OperacaoError);
    expect((await ordensRepo.buscarPorId(NEGOCIO, os.id))?.status).toBe("ABERTA");
  });

  it("não aprova orçamento sem itens", async () => {
    const { cliente, veiculo } = await montarCenario();

    const criado = await new CriarOrcamentoUseCase(
      orcamentosRepo,
      clientesRepo,
      servicosRepo,
    ).executar({
      negocioId: NEGOCIO,
      clienteId: cliente.id,
      veiculoId: veiculo.id,
      itens: [],
    });
    await new AbrirOrcamentoUseCase(orcamentosRepo).executar({
      negocioId: NEGOCIO,
      orcamentoId: criado.id,
    });

    await expect(
      new AprovarOrcamentoUseCase(orcamentosRepo).executar({
        negocioId: NEGOCIO,
        orcamentoId: criado.id,
      }),
    ).rejects.toThrow(ComercialError);
  });

  it("não entrega OS fora de CONCLUIDA (ABERTA, EM_EXECUCAO, PAUSADA, CANCELADA)", async () => {
    // ABERTA — nunca entrou em produção.
    const { os: aberta } = await montarOsAberta("1");
    await expect(
      new EntregarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: aberta.id,
      }),
    ).rejects.toThrow(OperacaoError);

    // EM_EXECUCAO — ainda em produção.
    const { os: emExecucao } = await montarOsAberta("2");
    await new IniciarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: emExecucao.id,
    });
    await expect(
      new EntregarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: emExecucao.id,
      }),
    ).rejects.toThrow(OperacaoError);

    // PAUSADA — produção pausada.
    const { os: pausada } = await montarOsAberta("3");
    await new IniciarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: pausada.id,
    });
    await new PausarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: pausada.id,
    });
    await expect(
      new EntregarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: pausada.id,
      }),
    ).rejects.toThrow(OperacaoError);

    // CANCELADA — encerrada.
    const { os: cancelada } = await montarOsAberta("4");
    await new CancelarOrdemServicoUseCase(ordensRepo).execute({
      negocioId: NEGOCIO,
      ordemServicoId: cancelada.id,
      motivo: "cliente desistiu",
    });
    await expect(
      new EntregarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: cancelada.id,
      }),
    ).rejects.toThrow(OperacaoError);
  });

  it("não altera OS ENTREGUE", async () => {
    const os = await montarOsEntregue();
    expect(os.status).toBe("ENTREGUE");

    await expect(
      new AtualizarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: os.id,
        observacoes: "alteração após entrega",
      }),
    ).rejects.toThrow(OperacaoError);
    expect((await ordensRepo.buscarPorId(NEGOCIO, os.id))?.status).toBe("ENTREGUE");
  });

  it("não cancela OS ENTREGUE", async () => {
    const os = await montarOsEntregue();

    await expect(
      new CancelarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: os.id,
        motivo: "teste",
      }),
    ).rejects.toThrow(OperacaoError);
  });

  it("não inicia OS ENTREGUE", async () => {
    const os = await montarOsEntregue();

    await expect(
      new IniciarOrdemServicoUseCase(ordensRepo).execute({
        negocioId: NEGOCIO,
        ordemServicoId: os.id,
      }),
    ).rejects.toThrow(OperacaoError);
  });
});
