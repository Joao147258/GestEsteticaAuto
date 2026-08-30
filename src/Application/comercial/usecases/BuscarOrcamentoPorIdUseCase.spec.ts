import { Orcamento } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { BuscarOrcamentoPorIdUseCase } from "./BuscarOrcamentoPorIdUseCase";

describe("BuscarOrcamentoPorIdUseCase", () => {
  it("retorna o orçamento projetado quando encontrado", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "Polimento",
      quantidade: 2,
      valorUnitario: 100,
    });

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
    } as unknown as OrcamentosRepository;

    const useCase = new BuscarOrcamentoPorIdUseCase(repositorio);
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
    });

    expect(repositorio.buscarPorId).toHaveBeenCalledWith("neg-1", orcamento.id);
    expect(output.id).toBe(orcamento.id);
    expect(output.negocioId).toBe("neg-1");
    expect(output.clienteId).toBe("cli-1");
    expect(output.veiculoId).toBe("vei-1");
    expect(output.valorTotal).toBe(200);
    expect(output.itens).toHaveLength(1);
    expect(output.itens[0]).toMatchObject({
      servicoId: "serv-1",
      nomeServico: "Polimento",
      valorTotal: 200,
    });
  });

  it("lança OrcamentoNaoEncontradoError quando o orçamento não existe", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as OrcamentosRepository;

    const useCase = new BuscarOrcamentoPorIdUseCase(repositorio);

    await expect(
      useCase.executar({ negocioId: "neg-1", orcamentoId: "inexistente" }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
  });
});
