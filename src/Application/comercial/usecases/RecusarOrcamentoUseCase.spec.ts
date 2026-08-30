import { Orcamento } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { RecusarOrcamentoUseCase } from "./RecusarOrcamentoUseCase";

describe("RecusarOrcamentoUseCase", () => {
  function criarOrcamentoAberto() {
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
    orcamento.abrir();
    return orcamento;
  }

  it("recusa orçamento com motivo registrado no aceite e salva", async () => {
    const orcamento = criarOrcamentoAberto();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new RecusarOrcamentoUseCase(repositorio);
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
      motivo: "preço alto",
    });

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.status).toBe("RECUSADO");
    expect(orcamento.aceite?.status).toBe("RECUSADO");
    expect(orcamento.aceite?.observacoes).toBe("preço alto");
  });

  it("lança OrcamentoNaoEncontradoError quando o orçamento não existe", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;

    const useCase = new RecusarOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({ negocioId: "neg-1", orcamentoId: "inexistente" }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
    expect(repositorio.salvar).not.toHaveBeenCalled();
  });
});
