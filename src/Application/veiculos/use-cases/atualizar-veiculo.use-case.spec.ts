import { Veiculo } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { VeiculosRepository } from "../repositories/veiculos.repository";
import { AtualizarVeiculoUseCase } from "./atualizar-veiculo.use-case";

describe("AtualizarVeiculoUseCase", () => {
  function criarVeiculo() {
    return Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      placa: "ABC1234",
      marca: "Toyota",
      modelo: "Corolla",
    });
  }

  it("atualiza apenas os campos informados (atualização parcial)", async () => {
    const veiculo = criarVeiculo();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new AtualizarVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(veiculo),
      salvar,
    } as unknown as VeiculosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      veiculoId: veiculo.id,
      cor: "Preto",
    });

    // Só a cor muda; os demais campos permanecem intactos.
    expect(resultado.cor).toBe("Preto");
    expect(resultado.placa).toBe("ABC1234");
    expect(resultado.marca).toBe("Toyota");
    expect(resultado.modelo).toBe("Corolla");
    expect(resultado.clienteId).toBe("cli-1");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(veiculo);
  });

  it("lança NotFoundError quando o veículo não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new AtualizarVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as VeiculosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", veiculoId: "vei-inexistente", cor: "Preto" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("verifica duplicidade quando a placa muda para outra já existente", async () => {
    const veiculo = criarVeiculo();
    const outroVeiculo = Veiculo.criar({
      negocioId: "neg-1",
      clienteId: "cli-2",
      placa: "XYZ9876",
      marca: "Honda",
      modelo: "Civic",
    });
    const salvar = jest.fn();

    const useCase = new AtualizarVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(veiculo),
      buscarPorPlaca: jest.fn().mockResolvedValue(outroVeiculo),
      salvar,
    } as unknown as VeiculosRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        veiculoId: veiculo.id,
        placa: "XYZ9876",
      }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("não verifica duplicidade quando a placa não muda", async () => {
    const veiculo = criarVeiculo();
    const buscarPorPlaca = jest.fn();

    const useCase = new AtualizarVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(veiculo),
      buscarPorPlaca,
      salvar: jest.fn().mockResolvedValue(undefined),
    } as unknown as VeiculosRepository);

    await useCase.execute({
      negocioId: "neg-1",
      veiculoId: veiculo.id,
      placa: "ABC1234", // mesma placa atual
      cor: "Azul",
    });

    expect(buscarPorPlaca).not.toHaveBeenCalled();
  });

  it("não altera o clienteId na atualização comum", async () => {
    const veiculo = criarVeiculo();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new AtualizarVeiculoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(veiculo),
      salvar,
    } as unknown as VeiculosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      veiculoId: veiculo.id,
      marca: "Toyota",
      modelo: "Corolla XEi",
    });

    expect(resultado.clienteId).toBe("cli-1");
  });
});
