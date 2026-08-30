import { Cliente } from "../../../Domain";
import { ClientesRepository } from "../repositories/clientes.repository";
import { BuscarClientePorIdUseCase } from "./buscar-cliente-por-id.use-case";

describe("BuscarClientePorIdUseCase", () => {
  it("retorna cliente quando encontrado", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
    });
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(cliente),
    } as unknown as ClientesRepository;

    const useCase = new BuscarClientePorIdUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
    });

    expect(resultado).toBe(cliente);
    expect(repositorio.buscarPorId).toHaveBeenCalledWith("neg-1", cliente.id);
  });

  it("retorna null quando não encontra o cliente", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
    } as unknown as ClientesRepository;

    const useCase = new BuscarClientePorIdUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: "inexistente",
    });

    expect(resultado).toBeNull();
  });
});
