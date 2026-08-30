import { Orcamento, ComercialError } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { AbrirOrcamentoUseCase } from "./AbrirOrcamentoUseCase";

describe("AbrirOrcamentoUseCase", () => {
  function criarOrcamentoRascunho() {
    return Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
  }

  it("abre orçamento RASCUNHO → EM_ABERTO e salva", async () => {
    const orcamento = criarOrcamentoRascunho();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new AbrirOrcamentoUseCase(repositorio);
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
    });

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.status).toBe("EM_ABERTO");
    expect(orcamento.status).toBe("EM_ABERTO");
  });

  it("lança OrcamentoNaoEncontradoError quando o orçamento não existe", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;

    const useCase = new AbrirOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({ negocioId: "neg-1", orcamentoId: "inexistente" }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
    expect(repositorio.salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do domínio quando o orçamento não está RASCUNHO e não salva", async () => {
    const orcamento = criarOrcamentoRascunho();
    orcamento.abrir(); // já EM_ABERTO
    const salvar = jest.fn();

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new AbrirOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({ negocioId: "neg-1", orcamentoId: orcamento.id }),
    ).rejects.toThrow(ComercialError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
