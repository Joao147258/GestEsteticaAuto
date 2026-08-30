import { CatalogoError, Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
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
