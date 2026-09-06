import { CatalogoError, Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ValidationError } from "../../../Shared/errors/validation.error";
import { ServicosRepository } from "../repositories/servicos.repository";
import { AtualizarServicoUseCase } from "./atualizar-servico.use-case";

describe("AtualizarServicoUseCase", () => {
  it("atualiza apenas os campos informados e salva", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem",
      precoBase: 100,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new AtualizarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      salvar,
    } as unknown as ServicosRepository);

    await useCase.execute({
      negocioId: "neg-1",
      servicoId: servico.id,
      precoBase: 150,
      descricao: "Lavagem completa",
    });

    // Só os campos enviados mudam; nome permanece intacto.
    expect(servico.precoBase).toBe(150);
    expect(servico.descricao).toBe("Lavagem completa");
    expect(servico.nome).toBe("Lavagem");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(servico);
  });

  it("atualiza o nome do serviço com sucesso quando não há duplicidade", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem Simples",
      precoBase: 80,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    const buscarPorNome = jest.fn().mockResolvedValue(null);

    const useCase = new AtualizarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      buscarPorNome,
      salvar,
    } as unknown as ServicosRepository);

    await useCase.execute({
      negocioId: "neg-1",
      servicoId: servico.id,
      nome: "Lavagem Técnica",
    });

    expect(servico.nome).toBe("Lavagem Técnica");
    expect(buscarPorNome).toHaveBeenCalledWith("neg-1", "Lavagem Técnica");
    expect(salvar).toHaveBeenCalledWith(servico);
  });

  it("permite manter o mesmo nome do serviço atual", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Polimento",
      precoBase: 300,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);
    // Simula que o repositório encontra o próprio serviço
    const buscarPorNome = jest.fn().mockResolvedValue(servico);

    const useCase = new AtualizarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      buscarPorNome,
      salvar,
    } as unknown as ServicosRepository);

    await useCase.execute({
      negocioId: "neg-1",
      servicoId: servico.id,
      nome: "Polimento",
      precoBase: 350,
    });

    expect(servico.nome).toBe("Polimento");
    expect(servico.precoBase).toBe(350);
    expect(salvar).toHaveBeenCalledWith(servico);
  });

  it("não permite atualizar para nome já usado por outro serviço no mesmo negócio", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Higienização",
      precoBase: 200,
    });
    const outroServico = Servico.criar({
      negocioId: "neg-1",
      nome: "Cristalização",
      precoBase: 400,
    });
    const salvar = jest.fn();
    const buscarPorNome = jest.fn().mockResolvedValue(outroServico);

    const useCase = new AtualizarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      buscarPorNome,
      salvar,
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: servico.id,
        nome: "Cristalização",
      }),
    ).rejects.toThrow(ValidationError);

    expect(salvar).not.toHaveBeenCalled();
  });

  it("lança NotFoundError quando o serviço não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new AtualizarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: "serv-inexistente",
        nome: "Novo nome",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando o preço é negativo e não salva", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem",
      precoBase: 100,
    });
    const salvar = jest.fn();

    const useCase = new AtualizarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      salvar,
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: servico.id,
        precoBase: -5,
      }),
    ).rejects.toThrow(CatalogoError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
