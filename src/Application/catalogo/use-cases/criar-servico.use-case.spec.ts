import { Servico } from "../../../Domain";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ServicosRepository } from "../repositories/servicos.repository";
import { CriarServicoUseCase } from "./criar-servico.use-case";

describe("CriarServicoUseCase", () => {
  it("cria serviço com sucesso e salva", async () => {
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new CriarServicoUseCase({
      buscarPorNome: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as ServicosRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      nome: "Lavagem detalhada",
      precoBase: 120,
    });

    expect(resultado).toBeInstanceOf(Servico);
    expect(resultado.negocioId).toBe("neg-1");
    expect(resultado.nome).toBe("Lavagem detalhada");
    expect(resultado.precoBase).toBe(120);
    expect(resultado.status).toBe("ATIVO");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(resultado);
  });

  it("busca por nome no escopo do negocioId", async () => {
    const buscarPorNome = jest.fn().mockResolvedValue(null);

    const useCase = new CriarServicoUseCase({
      buscarPorNome,
      salvar: jest.fn().mockResolvedValue(undefined),
    } as unknown as ServicosRepository);

    await useCase.execute({
      negocioId: "neg-1",
      nome: "Polimento técnico",
      precoBase: 300,
    });

    expect(buscarPorNome).toHaveBeenCalledWith("neg-1", "Polimento técnico");
  });

  it("lança ValidationError quando já existe serviço com o mesmo nome e não salva", async () => {
    const servicoExistente = Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem detalhada",
      precoBase: 120,
    });
    const salvar = jest.fn();

    const useCase = new CriarServicoUseCase({
      buscarPorNome: jest.fn().mockResolvedValue(servicoExistente),
      salvar,
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        nome: "Lavagem detalhada",
        precoBase: 120,
      }),
    ).rejects.toThrow(ValidationError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
