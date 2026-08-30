import { Orcamento } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { AtualizarObservacoesOrcamentoUseCase } from "./AtualizarObservacoesOrcamentoUseCase";

describe("AtualizarObservacoesOrcamentoUseCase", () => {
  it("atualiza as observações e salva", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new AtualizarObservacoesOrcamentoUseCase(repositorio);
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
      observacoes: "cliente pediu desconto",
    });

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.observacoes).toBe("cliente pediu desconto");
  });

  it("lança OrcamentoNaoEncontradoError quando o orçamento não existe", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;

    const useCase = new AtualizarObservacoesOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({
        negocioId: "neg-1",
        orcamentoId: "inexistente",
        observacoes: "anotação",
      }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
    expect(repositorio.salvar).not.toHaveBeenCalled();
  });
});
