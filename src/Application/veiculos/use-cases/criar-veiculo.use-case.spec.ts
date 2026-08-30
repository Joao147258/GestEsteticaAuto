import { Cliente, Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ClientesRepository } from "../../clientes/repositories/clientes.repository";
import { VeiculosRepository } from "../repositories/veiculos.repository";
import { CriarVeiculoUseCase } from "./criar-veiculo.use-case";

describe("CriarVeiculoUseCase", () => {
  function criarCliente() {
    return Cliente.criar({
      negocioId: "neg-1",
      nome: "Cliente Teste",
      tipo: "PESSOA_FISICA",
    });
  }

  function montarRepositorios(opcoes: {
    cliente: Cliente | null;
    veiculoPorPlaca?: Veiculo | null;
    salvar?: jest.Mock;
  }) {
    return {
      veiculosRepository: {
        buscarPorPlaca: jest.fn().mockResolvedValue(opcoes.veiculoPorPlaca ?? null),
        salvar: opcoes.salvar ?? jest.fn().mockResolvedValue(undefined),
      } as unknown as VeiculosRepository,
      clientesRepository: {
        buscarPorId: jest.fn().mockResolvedValue(opcoes.cliente),
      } as unknown as ClientesRepository,
    };
  }

  it("cria veículo com sucesso quando cliente existe e placa está livre", async () => {
    const cliente = criarCliente();
    const salvar = jest.fn().mockResolvedValue(undefined);
    const repos = montarRepositorios({ cliente, salvar });

    const useCase = new CriarVeiculoUseCase(
      repos.veiculosRepository,
      repos.clientesRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
      placa: "ABC1234",
      marca: "Toyota",
      modelo: "Corolla",
      anoFabricacao: 2020,
      cor: "Prata",
    });

    expect(resultado).toBeInstanceOf(Veiculo);
    expect(resultado.clienteId).toBe(cliente.id);
    expect(resultado.marca).toBe("Toyota");
    expect(resultado.modelo).toBe("Corolla");
    expect(resultado.placa).toBe("ABC1234");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(resultado);
  });

  it("valida que o cliente existe no negócio antes de criar", async () => {
    const cliente = criarCliente();
    const repos = montarRepositorios({ cliente });

    const useCase = new CriarVeiculoUseCase(
      repos.veiculosRepository,
      repos.clientesRepository,
    );
    await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
      marca: "Toyota",
      modelo: "Corolla",
    });

    expect(repos.clientesRepository.buscarPorId).toHaveBeenCalledWith(
      "neg-1",
      cliente.id,
    );
  });

  it("lança NotFoundError quando o cliente não existe e não salva", async () => {
    const salvar = jest.fn();
    const repos = montarRepositorios({ cliente: null, salvar });

    const useCase = new CriarVeiculoUseCase(
      repos.veiculosRepository,
      repos.clientesRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        clienteId: "cli-inexistente",
        marca: "Toyota",
        modelo: "Corolla",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("lança ValidationError quando a placa já está cadastrada e não salva", async () => {
    const cliente = criarCliente();
    const veiculoExistente = Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "outro-cliente",
      placa: "ABC1234",
      marca: "Honda",
      modelo: "Civic",
    });
    const salvar = jest.fn();
    const repos = montarRepositorios({
      cliente,
      veiculoPorPlaca: veiculoExistente,
      salvar,
    });

    const useCase = new CriarVeiculoUseCase(
      repos.veiculosRepository,
      repos.clientesRepository,
    );

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        clienteId: cliente.id,
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
      }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("permite criar sem placa (não consulta duplicidade)", async () => {
    const cliente = criarCliente();
    const buscarPorPlaca = jest.fn();
    const repos = montarRepositorios({
      cliente,
      veiculoPorPlaca: null,
      salvar: jest.fn().mockResolvedValue(undefined),
    });

    const useCase = new CriarVeiculoUseCase(
      {
        buscarPorPlaca,
        salvar: repos.veiculosRepository.salvar,
      } as unknown as VeiculosRepository,
      repos.clientesRepository,
    );
    const resultado = await useCase.execute({
      negocioId: "neg-1",
      clienteId: cliente.id,
      marca: "Toyota",
      modelo: "Corolla",
    });

    expect(resultado.placa).toBeNull();
    expect(buscarPorPlaca).not.toHaveBeenCalled();
  });
});
