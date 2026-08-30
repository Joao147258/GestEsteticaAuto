import { Cliente } from "../../../Domain";
import { ClientesRepository } from "../repositories/clientes.repository";
import { BuscarClientePorDocumentoUseCase } from "./buscar-cliente-por-documento.use-case";

describe("BuscarClientePorDocumentoUseCase", () => {
  it("retorna cliente quando o documento é encontrado no negócio", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
      documento: "123.456.789-00",
    });
    const repositorio = {
      buscarPorDocumento: jest.fn().mockResolvedValue(cliente),
    } as unknown as ClientesRepository;

    const useCase = new BuscarClientePorDocumentoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      documento: "123.456.789-00",
    });

    expect(resultado).toBe(cliente);
    expect(repositorio.buscarPorDocumento).toHaveBeenCalledWith(
      "neg-1",
      "123.456.789-00",
    );
  });

  it("retorna null quando não existe cliente com o documento no negócio", async () => {
    const repositorio = {
      buscarPorDocumento: jest.fn().mockResolvedValue(null),
    } as unknown as ClientesRepository;

    const useCase = new BuscarClientePorDocumentoUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      documento: "999.999.999-99",
    });

    expect(resultado).toBeNull();
  });
});
