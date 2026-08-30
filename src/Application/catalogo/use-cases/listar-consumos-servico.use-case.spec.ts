import { ConsumoInsumoServico } from "../../../Domain";
import { ConsumosInsumoServicoRepository } from "../repositories/consumos-insumo-servico.repository";
import { ListarConsumosServicoUseCase } from "./listar-consumos-servico.use-case";

describe("ListarConsumosServicoUseCase", () => {
  it("lista os consumos configurados para o serviço no negócio", async () => {
    const consumo = ConsumoInsumoServico.criar({
      negocioId: "neg-1",
      servicoId: "serv-1",
      produtoId: "prod-1",
      quantidade: 2,
      unidadeMedida: "UNIDADE",
    });
    const listarPorServico = jest.fn().mockResolvedValue([consumo]);
    const repositorio = {
      listarPorServico,
    } as unknown as ConsumosInsumoServicoRepository;

    const useCase = new ListarConsumosServicoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      servicoId: "serv-1",
    });

    expect(resultado).toEqual([consumo]);
    expect(listarPorServico).toHaveBeenCalledWith("neg-1", "serv-1");
  });

  it("retorna lista vazia quando o serviço não possui consumos", async () => {
    const listarPorServico = jest.fn().mockResolvedValue([]);
    const repositorio = {
      listarPorServico,
    } as unknown as ConsumosInsumoServicoRepository;

    const useCase = new ListarConsumosServicoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      servicoId: "serv-1",
    });

    expect(resultado).toEqual([]);
  });
});
