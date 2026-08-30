import { Cliente } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ClientesRepository } from "../repositories/clientes.repository";
import { AtualizarClienteUseCase } from "./atualizar-cliente.use-case";

describe("AtualizarClienteUseCase", () => {
  it("atualiza cliente com sucesso e salva no repositório", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(cliente),
      buscarPorDocumento: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new AtualizarClienteUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
      nome: "João da Silva",
      documento: "123.456.789-00",
      telefone: "(11) 99999-0000",
      email: "joao@email.com",
    });

    expect(repositorio.buscarPorId).toHaveBeenCalledWith("neg-1", cliente.id);
    expect(repositorio.buscarPorDocumento).toHaveBeenCalledWith(
      "neg-1",
      "123.456.789-00",
    );
    expect(resultado).toBe(cliente);
    expect(resultado.nome).toBe("João da Silva");
    expect(resultado.documento).toBe("123.456.789-00");
    expect(resultado.telefone).toBe("(11) 99999-0000");
    expect(resultado.email).toBe("joao@email.com");
    expect(salvar).toHaveBeenCalledWith(cliente);
  });

  it("bloqueia atualização de cliente inexistente", async () => {
    const salvar = jest.fn();
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      buscarPorDocumento: jest.fn(),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new AtualizarClienteUseCase(repositorio);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        clienteId: "inexistente",
        nome: "Novo Nome",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
    expect(repositorio.buscarPorDocumento).not.toHaveBeenCalled();
  });

  it("atualiza apenas os campos informados e preserva os demais", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
      documento: "123.456.789-00",
      telefone: "(11) 99999-0000",
      email: "joao@email.com",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(cliente),
      buscarPorDocumento: jest.fn(),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new AtualizarClienteUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
      nome: "Maria",
    });

    expect(resultado.nome).toBe("Maria");
    expect(resultado.documento).toBe("123.456.789-00");
    expect(resultado.telefone).toBe("(11) 99999-0000");
    expect(resultado.email).toBe("joao@email.com");
    expect(repositorio.buscarPorDocumento).not.toHaveBeenCalled();
    expect(salvar).toHaveBeenCalledWith(cliente);
  });

  it("bloqueia documento que pertence a outro cliente do mesmo negócio", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
    });
    const outroComDocumento = Cliente.criar({
      negocioId: "neg-1",
      nome: "Outro Cliente",
      tipo: "PESSOA_FISICA",
      documento: "123.456.789-00",
    });
    const salvar = jest.fn();
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(cliente),
      buscarPorDocumento: jest.fn().mockResolvedValue(outroComDocumento),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new AtualizarClienteUseCase(repositorio);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        clienteId: cliente.id,
        documento: "123.456.789-00",
      }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("permite limpar campo opcional quando enviado como null", async () => {
    const cliente = Cliente.criar({
      negocioId: "neg-1",
      nome: "João",
      tipo: "PESSOA_FISICA",
      telefone: "(11) 99999-0000",
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(cliente),
      buscarPorDocumento: jest.fn(),
      salvar,
    } as unknown as ClientesRepository;

    const useCase = new AtualizarClienteUseCase(repositorio);
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
      telefone: null,
    });

    expect(resultado.telefone).toBeNull();
    expect(salvar).toHaveBeenCalledWith(cliente);
  });
});
