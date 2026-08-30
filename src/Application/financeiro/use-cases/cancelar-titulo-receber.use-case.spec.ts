import { FinanceiroError, TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";
import { CancelarTituloReceberUseCase } from "./cancelar-titulo-receber.use-case";

describe("CancelarTituloReceberUseCase", () => {
  function criarTitulo() {
    return TituloFinanceiro.criar({
      negocioId: "neg-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      clienteId: "cli-1",
      descricao: "Serviço de estética",
      valorOriginal: 500,
      parcelas: [
        {
          numero: 1,
          tipo: "PARCELA",
          valorOriginal: 500,
          dataVencimento: new Date("2026-09-01"),
        },
      ],
    });
  }

  it("cancela um título com motivo e salva (mantém histórico)", async () => {
    const titulo = criarTitulo();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new CancelarTituloReceberUseCase({
      buscarPorId: jest.fn().mockResolvedValue(titulo),
      salvar,
    } as unknown as TitulosReceberRepository);

    const resultado = await useCase.execute({
      negocioId: "neg-1",
      tituloId: titulo.id,
      motivo: "Cliente desistiu do serviço",
    });

    expect(resultado.status).toBe("CANCELADO");
    expect(resultado.motivoCancelamento).toBe("Cliente desistiu do serviço");
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(titulo);
  });

  it("lança NotFoundError quando o título não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new CancelarTituloReceberUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as TitulosReceberRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        tituloId: "tit-inexistente",
        motivo: "teste",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando o título já está pago e não salva", async () => {
    const titulo = criarTitulo();
    const pagamentoId = titulo.registrarPagamento({
      parcelaFinanceiraId: titulo.parcelas[0].id,
      valor: 500,
      formaPagamentoId: "fp-pix",
      formaPagamentoDescricao: "PIX",
    });
    titulo.confirmarPagamento(pagamentoId);
    const salvar = jest.fn();

    const useCase = new CancelarTituloReceberUseCase({
      buscarPorId: jest.fn().mockResolvedValue(titulo),
      salvar,
    } as unknown as TitulosReceberRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        tituloId: titulo.id,
        motivo: "teste",
      }),
    ).rejects.toThrow(FinanceiroError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
