import { Servico } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ServicosRepository } from "../repositories/servicos.repository";
import { ListarServicosUseCase } from "./listar-servicos.use-case";

describe("ListarServicosUseCase", () => {
  it("repassa os filtros e aplica defaults de paginação (1/20)", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem",
      precoBase: 120,
    });
    const listarPorNegocio = jest.fn().mockResolvedValue([servico]);

    const useCase = new ListarServicosUseCase({
      listarPorNegocio,
    } as unknown as ServicosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      busca: "lavagem",
    });

    expect(resultado).toEqual([servico]);
    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      busca: "lavagem",
      pagina: 1,
      limite: 20,
      ativo: undefined,
    });
  });

  it("repassa pagina, limite e filtro ativo quando informados", async () => {
    const listarPorNegocio = jest.fn().mockResolvedValue([]);

    const useCase = new ListarServicosUseCase({
      listarPorNegocio,
    } as unknown as ServicosRepository);

    await useCase.execute({
      negocioId: "neg-1",
      pagina: 2,
      limite: 50,
      ativo: true,
    });

    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      busca: undefined,
      pagina: 2,
      limite: 50,
      ativo: true,
    });
  });

  it("lança ValidationError quando página é menor que 1", async () => {
    const useCase = new ListarServicosUseCase({
      listarPorNegocio: jest.fn(),
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", pagina: 0 }),
    ).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError quando limite está fora de 1-100", async () => {
    const useCase = new ListarServicosUseCase({
      listarPorNegocio: jest.fn(),
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", limite: 200 }),
    ).rejects.toThrow(ValidationError);
  });

  it("retorna lista vazia sem lançar erro", async () => {
    const useCase = new ListarServicosUseCase({
      listarPorNegocio: jest.fn().mockResolvedValue([]),
    } as unknown as ServicosRepository);

    const resultado = await useCase.execute({ negocioId: "neg-1" });

    expect(resultado).toEqual([]);
  });
});
