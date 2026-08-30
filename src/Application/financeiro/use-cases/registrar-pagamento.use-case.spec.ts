import { FinanceiroError, TituloFinanceiro } from "../../../Domain";
import { NotFoundError } from "../../../Shared/errors/not-found.error";
import { TitulosReceberRepository } from "../repositories/titulos-receber.repository";
import { RegistrarPagamentoUseCase } from "./registrar-pagamento.use-case";

describe("RegistrarPagamentoUseCase", () => {
  function criarTitulo(valorOriginal: number) {
    return TituloFinanceiro.criar({
      negocioId: "neg-1",
      origem: "ORCAMENTO",
      origemId: "orc-1",
      clienteId: "cli-1",
      descricao: "Serviço de estética",
      valorOriginal,
      parcelas: [
        {
          numero: 1,
          tipo: "PARCELA",
          valorOriginal,
          dataVencimento: new Date("2026-09-01"),
        },
      ],
    });
  }

  function montarInput(titulo: TituloFinanceiro, valor: number) {
    return {
      negocioId: "neg-1",
      tituloId: titulo.id,
      parcelaFinanceiraId: titulo.parcelas[0].id,
      valor,
      formaPagamentoId: "fp-pix",
      formaPagamentoDescricao: "PIX",
    };
  }

  it("registra pagamento parcial e o Domain deixa o título PARCIALMENTE_PAGO", async () => {
    const titulo = criarTitulo(500);
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new RegistrarPagamentoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(titulo),
      salvar,
    } as unknown as TitulosReceberRepository);

    const resultado = await useCase.execute(montarInput(titulo, 200));

    // 500 - 200 → saldo 300: Domain decide PARCIALMENTE_PAGO.
    expect(resultado.status).toBe("PARCIALMENTE_PAGO");
    expect(resultado.saldoAberto).toBe(300);
    expect(resultado.parcelas[0].valorPago).toBe(200);
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(titulo);
  });

  it("registra pagamento total e o Domain deixa o título PAGO", async () => {
    const titulo = criarTitulo(500);
    const salvar = jest.fn().mockResolvedValue(undefined);

    const useCase = new RegistrarPagamentoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(titulo),
      salvar,
    } as unknown as TitulosReceberRepository);

    const resultado = await useCase.execute(montarInput(titulo, 500));

    expect(resultado.status).toBe("PAGO");
    expect(resultado.saldoAberto).toBe(0);
    expect(salvar).toHaveBeenCalledTimes(1);
  });

  it("lança NotFoundError quando o título não existe e não salva", async () => {
    const salvar = jest.fn();
    const useCase = new RegistrarPagamentoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar,
    } as unknown as TitulosReceberRepository);

    await expect(
      useCase.execute({
        negocioId: "neg-1",
        tituloId: "tit-inexistente",
        parcelaFinanceiraId: "parc-1",
        valor: 100,
        formaPagamentoId: "fp-pix",
      }),
    ).rejects.toThrow(NotFoundError);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("propaga erro do Domain quando o pagamento excede o saldo e não salva", async () => {
    const titulo = criarTitulo(500);
    const salvar = jest.fn();

    const useCase = new RegistrarPagamentoUseCase({
      buscarPorId: jest.fn().mockResolvedValue(titulo),
      salvar,
    } as unknown as TitulosReceberRepository);

    await expect(useCase.execute(montarInput(titulo, 600))).rejects.toThrow(
      FinanceiroError,
    );
    expect(salvar).not.toHaveBeenCalled();
    expect(titulo.parcelas[0].valorPago).toBe(0);
  });
});
