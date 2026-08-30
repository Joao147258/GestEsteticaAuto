import { Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ServicosRepository } from "../repositories/servicos.repository";
import { BuscarServicoUseCase } from "./buscar-servico.use-case";

describe("BuscarServicoUseCase", () => {
  it("retorna o serviço encontrado", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Polimento técnico",
      precoBase: 300,
    });
    const buscarPorId = jest.fn().mockResolvedValue(servico);

    const useCase = new BuscarServicoUseCase({
      buscarPorId,
    } as unknown as ServicosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      servicoId: servico.id,
    });

    expect(resultado).toBe(servico);
  });

  it("usa negocioId na busca (nunca busca só por servicoId)", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Polimento técnico",
      precoBase: 300,
    });
    const buscarPorId = jest.fn().mockResolvedValue(servico);

    const useCase = new BuscarServicoUseCase({
      buscarPorId,
    } as unknown as ServicosRepository);

    await useCase.execute({ negocioId: "neg-1", servicoId: servico.id });

    expect(buscarPorId).toHaveBeenCalledWith("neg-1", servico.id);
  });

  it("lança NotFoundError quando o serviço não existe", async () => {
    const useCase = new BuscarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", servicoId: "serv-inexistente" }),
    ).rejects.toThrow(NotFoundError);
  });
});
