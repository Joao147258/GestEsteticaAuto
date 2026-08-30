import { Orcamento, ComercialError } from "../../../Domain/comercial";
import { OrcamentosRepository } from "../repositories/OrcamentosRepository";
import { OrcamentoNaoEncontradoError } from "../errors/OrcamentoNaoEncontradoError";
import { AprovarOrcamentoUseCase } from "./AprovarOrcamentoUseCase";

describe("AprovarOrcamentoUseCase", () => {
  function criarOrcamentoAberto() {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    orcamento.adicionarItem({
      tipo: "SERVICO",
      referenciaId: "serv-1",
      descricao: "Lavagem",
      quantidade: 1,
      valorUnitario: 120,
    });
    orcamento.abrir();
    return orcamento;
  }

  it("aprova orçamento EM_ABERTO e salva", async () => {
    const orcamento = criarOrcamentoAberto();
    const salvar = jest.fn().mockResolvedValue(undefined);

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new AprovarOrcamentoUseCase(repositorio);
    const output = await useCase.executar({
      negocioId: "neg-1",
      orcamentoId: orcamento.id,
    });

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(output.status).toBe("ACEITO");
    expect(orcamento.aceite?.status).toBe("ACEITO");
  });

  it("lança OrcamentoNaoEncontradoError quando o orçamento não existe", async () => {
    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(null),
      salvar: jest.fn(),
    } as unknown as OrcamentosRepository;

    const useCase = new AprovarOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({ negocioId: "neg-1", orcamentoId: "inexistente" }),
    ).rejects.toThrow(OrcamentoNaoEncontradoError);
    expect(repositorio.salvar).not.toHaveBeenCalled();
  });

  it("não aprova orçamento RASCUNHO (regra do domínio) e não salva", async () => {
    const orcamento = Orcamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
    });
    const salvar = jest.fn();

    const repositorio = {
      buscarPorId: jest.fn().mockResolvedValue(orcamento),
      salvar,
    } as unknown as OrcamentosRepository;

    const useCase = new AprovarOrcamentoUseCase(repositorio);

    await expect(
      useCase.executar({ negocioId: "neg-1", orcamentoId: orcamento.id }),
    ).rejects.toThrow(ComercialError);
    expect(salvar).not.toHaveBeenCalled();
  });
});
