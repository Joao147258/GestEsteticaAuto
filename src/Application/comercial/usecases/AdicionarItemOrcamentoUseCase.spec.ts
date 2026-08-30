import { Servico } from "../../../Domain";
import { Orcamento } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { ServicosRepository } from "../../catalogo/repositories/servicos.repository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { ServicoNaoEncontradoError } from "../errors/ServicoNaoEncontradoError";
import { AdicionarItemOrcamentoUseCase } from "./AdicionarItemOrcamentoUseCase";

describe("AdicionarItemOrcamentoUseCase", () => {
  it("adiciona item, recalcula total no domínio e salva", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Polimento",
      precoBase: 100,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const orcamentosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;
    const servicosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(servico),
    } as unknown as ServicosRepository;

    const useCase = new AdicionarItemOrcamentoUseCase(
      orcamentosRepository,
      servicosRepository,
    );
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
      servicoId: "serv-1",
      quantidade: 2,
      valorUnitario: 150,
      observacao: "brilho total",
    });

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.itens).toHaveLength(1);
    expect(output.itens[0]).toMatchObject({
      servicoId: servico.id,
      nomeServico: "Polimento",
      quantidade: 2,
      valorUnitario: 150,
      valorTotal: 300,
      observacao: "brilho total",
    });
    expect(output.valorTotal).toBe(300);
  });

  it("lança OrcamentoNaoEncontradoError e não busca serviço quando o orçamento não existe", async () => {
    const orcamentosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;
    const servicosRepository = {
      buscarPorId: jest.fn(),
    } as unknown as ServicosRepository;

    const useCase = new AdicionarItemOrcamentoUseCase(
      orcamentosRepository,
      servicosRepository,
    );

    await expect(
      useCase.executar({
        negocioId: "neg-1",
        orcamentoId: "inexistente",
        servicoId: "serv-1",
        quantidade: 1,
        valorUnitario: 10,
      }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
    expect(servicosRepository.buscarPorId).not.toHaveBeenCalled();
    expect(orcamentosRepository.salvar).not.toHaveBeenCalled();
  });

  it("lança ServicoNaoEncontradoError quando o serviço não existe no catálogo", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const orcamentosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;
    const servicosRepository = {
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as ServicosRepository;

    const useCase = new AdicionarItemOrcamentoUseCase(
      orcamentosRepository,
      servicosRepository,
    );

    await expect(
      useCase.executar({
        negocioId: "neg-1",
        orcamentoId: orcamento.id,
        servicoId: "inexistente",
        quantidade: 1,
        valorUnitario: 10,
      }),
    ).rejects.toThrow(ServicoNaoEncontradoError);
    expect(orcamentosRepository.salvar).not.toHaveBeenCalled();
  });
});
