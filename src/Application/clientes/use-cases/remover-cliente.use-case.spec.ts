import { Cliente } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ClientesRepository } from "../repositories/clientes.repository";
import { RemoverClienteUseCase } from "./remover-cliente.use-case";

describe("RemoverClienteUseCase", () => {
  it("remove cliente existente", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
    });
    const remover = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(cliente),
      remover,
    } as unknown as ClientesRepository;

    const useCase = new RemoverClienteUseCase(repositorio);
    await useCase.execute({ negocioId: "neg-1", clienteId: cliente.id });

    expect(remover).toHaveBeenCalledWith("neg-1", cliente.id);
  });

  it("bloqueia remoção de cliente inexistente", async () => {
    const remover = jest.fn();
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      remover,
    } as unknown as ClientesRepository;

    const useCase = new RemoverClienteUseCase(repositorio);

    await expect(
      useCase.execute({ negocioId: "neg-1", clienteId: "inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(remover).not.toHaveBeenCalled();
  });
});
