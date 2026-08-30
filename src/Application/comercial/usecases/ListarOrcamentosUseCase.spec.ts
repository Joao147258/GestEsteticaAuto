import { Orcamento } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { ListarOrcamentosUseCase } from "./ListarOrcamentosUseCase";

describe("ListarOrcamentosUseCase", () => {
  it("lista orçamentos do negócio com filtros e projeta a saída", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const listarPorNegocio = jest.fn().mockResolvedValue([orcamento]);
    const repositorio = {
      listarPorNegocio,
    } as unknown as OrcamentosRepository;

    const useCase = new ListarOrcamentosUseCase(repositorio);
    const resultado = await useCase.executar({
      negocioId: "neg-1",
      status: "RASCUNHO",
      pagina: 1,
      limite: 10,
    });

    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      clienteId: undefined,
      veiculoId: undefined,
      status: "RASCUNHO",
      dataInicio: undefined,
      dataFim: undefined,
      busca: undefined,
      pagina: 1,
      limite: 10,
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(orcamento.id);
    expect(resultado[0].status).toBe("RASCUNHO");
  });

  it("retorna lista vazia quando não há orçamentos", async () => {
    const repositorio = {
      listarPorNegocio: jest.fn().mockResolvedValue([]),
    } as unknown as OrcamentosRepository;

    const useCase = new ListarOrcamentosUseCase(repositorio);
    const resultado = await useCase.executar({ negocioId: "neg-1" });

    expect(resultado).toEqual([]);
  });
});
