import { Cliente, Servico } from "../../../Domain";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { ClientesRepository } from "../../clientes/repositories/clientes.repository";
import { ServicosRepository } from "../../catalogo/repositories/servicos.repository";
import { ClienteNaoEncontradoError } from "../errors/ClienteNaoEncontradoError";
import { ServicoNaoEncontradoError } from "../errors/ServicoNaoEncontradoError";
import { CriarOrcamentoUseCase } from "./CriarOrcamentoUseCase";

describe("CriarOrcamentoUseCase", () => {
  const input = {
    negocioId: "neg-1",
    clienteId: "cli-1",
    veiculoId: "vei-1",
    itens: [
      { servicoId: "serv-1", quantidade: 2, valorUnitario: 100 },
      { servicoId: "serv-2", quantidade: 1, valorUnitario: 250 },
    ],
    validadeEm: new Date("2026-12-31"),
    observacoes: "cliente pediu desconto",
  };

  function montarRepositorios(opcoes: {
    cliente?: Cliente | null;
    servicos?: Map<string, Servico>;
    salvar?: jest.Mock;
  }) {
    const clientesRepository = {
      buscarPorId: jest.fn().mockResolvedValue(opcoes.cliente ?? null),
    } as unknown as ClientesRepository;

    const servicosRepository = {
      buscarPorId: jest.fn().mockImplementation((_negocioId: string, servicoId: string) =>
        Promise.resolve(opcoes.servicos?.get(servicoId) ?? null),
      ),
    } as unknown as ServicosRepository;

    const orcamentosRepository = {
      salvar: opcoes.salvar ?? jest.fn().mockResolvedValue(undefined),
    } as unknown as OrcamentosRepository;

    return { clientesRepository, servicosRepository, orcamentosRepository };
  }

  it("cria orçamento RASCUNHO com itens, calcula total no domínio e salva", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João da Silva",
      tipo: "PESSOA_FISICA",
    });
    const polimento = Servico.criar({ negocioId: "neg-1", nome: "Polimento", precoBase: 100 });
    const vitrificacao = Servico.criar({ negocioId: "neg-1", nome: "Vitrificação", precoBase: 250 });

    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorios = montarRepositorios({
      cliente,
      servicos: new Map([
        ["serv-1", polimento],
        ["serv-2", vitrificacao],
      ]),
      salvar,
    });

    const useCase = new CriarOrcamentoUseCase(
      repositorios.orcamentosRepository,
      repositorios.clientesRepository,
      repositorios.servicosRepository,
    );
    const output = await useCase.executar(input);

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.status).toBe("RASCUNHO");
    expect(output.negocioId).toBe("neg-1");
    expect(output.clienteId).toBe("cli-1");
    expect(output.veiculoId).toBe("vei-1");
    // Total vem do domínio (nunca recebido pela use case): 2×100 + 1×250.
    expect(output.valorTotal).toBe(450);
    expect(output.itens).toHaveLength(2);
    expect(output.itens[0]).toMatchObject({
      servicoId: polimento.id,
      nomeServico: "Polimento",
      quantidade: 2,
      valorUnitario: 100,
      valorTotal: 200,
    });
    expect(output.itens[1]).toMatchObject({
      servicoId: vitrificacao.id,
      nomeServico: "Vitrificação",
      valorTotal: 250,
    });
    expect(output.observacoes).toBe("cliente pediu desconto");
    expect(output.validadeEm).toEqual(new Date("2026-12-31"));
  });

  it("lança ClienteNaoEncontradoError e não salva quando o cliente não existe", async () => {
    const repositorios = montarRepositorios({ cliente: null });

    const useCase = new CriarOrcamentoUseCase(
      repositorios.orcamentosRepository,
      repositorios.clientesRepository,
      repositorios.servicosRepository,
    );

    await expect(useCase.executar(input)).rejects.toThrow(ClienteNaoEncontradoError);
    expect(repositorios.orcamentosRepository.salvar).not.toHaveBeenCalled();
  });

  it("lança ServicoNaoEncontradoError e não salva quando um serviço não existe", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João da Silva",
      tipo: "PESSOA_FISICA",
    });
    const polimento = Servico.criar({ negocioId: "neg-1", nome: "Polimento", precoBase: 100 });
    // O mapa só tem serv-1; serv-2 não existe no catálogo do negócio.
    const repositorios = montarRepositorios({
      cliente,
      servicos: new Map([["serv-1", polimento]]),
    });

    const useCase = new CriarOrcamentoUseCase(
      repositorios.orcamentosRepository,
      repositorios.clientesRepository,
      repositorios.servicosRepository,
    );

    await expect(useCase.executar(input)).rejects.toThrow(ServicoNaoEncontradoError);
    expect(repositorios.orcamentosRepository.salvar).not.toHaveBeenCalled();
  });
});
