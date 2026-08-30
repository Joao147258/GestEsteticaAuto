import { Orcamento } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { RemoverItemOrcamentoUseCase } from "./RemoverItemOrcamentoUseCase";

describe("RemoverItemOrcamentoUseCase", () => {
  it("remove o item pelo itemId, recalcula e salva", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "Lavagem",
      quantidade: 1,
      valorUnitario: 120,
    });
    const itemId = orcamento.itens[0].id;
    const salvar = jest.fn().mockResolvedValue(undefined);

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new RemoverItemOrcamentoUseCase(repositorio);
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
      itemId,
    });

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.itens).toHaveLength(0);
    expect(output.valorTotal).toBe(0);
  });

  it("lança OrcamentoNaoEncontradoError quando o orçamento não existe", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;

    const useCase = new RemoverItemOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({
        negocioId: "neg-1",
        orcamentoId: "inexistente",
        itemId: "item-1",
      }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
    expect(repositorio.salvar).not.toHaveBeenCalled();
  });
});
