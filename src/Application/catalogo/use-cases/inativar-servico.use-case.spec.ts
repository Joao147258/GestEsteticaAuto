import { Servico } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { ServicosRepository } from "../repositories/servicos.repository";
import { InativarServicoUseCase } from "./inativar-servico.use-case";

describe("InativarServicoUseCase", () => {
  it("inativa o serviço e salva (não apaga o registro)", async () => {
    const servico = Servico.criar({
      negocioId: "neg-1",
      nome: "Lavagem",
      precoBase: 120,
    });
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new InativarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(servico),
      salvar,
    } as unknown as ServicosRepository);

    await useCase.execute({ negocioId: "neg-1", servicoId: servico.id });

    expect(servico.status).toBe("INATIVO");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(servico);
  });

  it("lança NotFoundError quando o serviço não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new InativarServicoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as ServicosRepository);

    await expect(
      useCase.execute({ negocioId: "neg-1", servicoId: "serv-inexistente" }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
