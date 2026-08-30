import { ValidationError } from "../../../Shared/errors/validation.error";
import { ClientesRepository } from "../repositories/clientes.repository";
import { ListarClientesPorNegocioUseCase } from "./listar-clientes-por-negocio.use-case";

describe("ListarClientesPorNegocioUseCase", () => {
  it("usa paginação padrão (página 1, limite 20) quando não informada", async () => {
    const listarPorNegocio = jest.fn().mockResolvedValue([]);
    const repositorio = { listarPorNegocio } as unknown as ClientesRepository;

    const useCase = new ListarClientesPorNegocioUseCase(repositorio);
    await useCase.execute({ negocioId: "neg-1" });

    expect(listarPorNegocio).toHaveBeenCalledWith({
      negocioId: "neg-1",
      busca: undefined,
      pagina: 1,
      limite: 20,
    });
  });

  it("bloqueia página inválida (menor que 1)", async () => {
    const repositorio = {
      listarPorNegocio: jest.fn(),
    } as unknown as ClientesRepository;

    const useCase = new ListarClientesPorNegocioUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", pagina: 0 }),
    ).rejects.toThrow(ValidationError);
  });

  it("bloqueia limite inválido (menor que 1)", async () => {
    const repositorio = {
      listarPorNegocio: jest.fn(),
    } as unknown as ClientesRepository;

    const useCase = new ListarClientesPorNegocioUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", limite: 0 }),
    ).rejects.toThrow(ValidationError);
  });

  it("bloqueia limite inválido (maior que 100)", async () => {
    const repositorio = {
      listarPorNegocio: jest.fn(),
    } as unknown as ClientesRepository;

    const useCase = new ListarClientesPorNegocioUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", limite: 101 }),
    ).rejects.toThrow(ValidationError);
  });
});
