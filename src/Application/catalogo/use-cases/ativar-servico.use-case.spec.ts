import { Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ServicosRepository } from "../repositories/servicos.repository";
import { AtivarServicoUseCase } from "./ativar-servico.use-case";

describe("AtivarServicoUseCase", () => {
  it("ativa serviço inativo com sucesso e salva no repositório", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Higienização Interna",
      precoBase: 250,
    });
    servico.inativar();
    expect(servico.status).toBe("INATIVO");

    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new AtivarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      salvar,
    } as unknown as ServicosRepository);

    await useCase.execute({ negocioId: "neg-1", servicoId: servico.id });

    expect(servico.status).toBe("ATIVO");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(servico);
  });

  it("mantém serviço ativo sem quebrar e salva (idempotência)", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Vitrificação de Pintura",
      precoBase: 1200,
    });
    expect(servico.status).toBe("ATIVO");

    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new AtivarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      salvar,
    } as unknown as ServicosRepository);

    await useCase.execute({ negocioId: "neg-1", servicoId: servico.id });

    expect(servico.status).toBe("ATIVO");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(servico);
  });

  it("lança NotFoundError quando o serviço não existe e não salva", async () => {
    const salvar = jest.fn();

    const useCase = new AtivarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        servicoId: "serv-inexistente",
      }),
    ).rejects.toThrow(NotFoundError);

    expect(salvar).not.toHaveBeenCalled();
  });
});
