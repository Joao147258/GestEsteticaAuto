import { Cliente } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import type { CriarClienteInput } from "../dtos/criar-cliente.input";
import { ClientesRepository } from "../repositories/clientes.repository";
import { CriarClienteUseCase } from "./criar-cliente.use-case";

describe("CriarClienteUseCase", () => {
  const input: CriarClienteInput = {
    negocioId: "neg-1",
    nome: "João da Silva",
    tipo: "PESSOA_FISICA",
    documento: "123.456.789-00",
    telefone: "(11) 99999-0000",
    email: "joao@email.com",
  };

  it("cria cliente com sucesso e salva no repositório", async () => {
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorDocumento: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new CriarClienteUseCase(repositorio);
    const cliente = await useCase.execute(input);

    expect(cliente).toBeInstanceOf(Cliente);
    expect(cliente.negocioId).toBe("neg-1");
    expect(cliente.nome).toBe("João da Silva");
    expect(cliente.tipo).toBe("PESSOA_FISICA");
    expect(repositorio.buscarPorDocumento).toHaveBeenCalledWith(
      "neg-1",
      "123.456.789-00",
    );
    expect(salvar).toHaveBeenCalledWith(cliente);
  });

  it("bloqueia criação quando já existe cliente com o mesmo documento no mesmo negócio", async () => {
    const existente = Cliente.criar({
      negocioId: "neg-1",
      nome: "Outro Cliente",
      tipo: "PESSOA_FISICA",
      documento: "123.456.789-00",
    });
    const salvar = jest.fn();
    const repositorio = {
      buscarPorDocumento: jest.fn().mockResolvedValue(existente),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new CriarClienteUseCase(repositorio);

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
