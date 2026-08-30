import { ItemOrdemServico } from "../../../../Domain/operacao";
import { PrismaItemOrdemServicoMapper } from "./prisma-item-ordem-servico.mapper";

// PrismaItemOrdemServicoMapper.spec — valida a conversão do item de OS.
// Os campos comerciais legados (produtoId, quantidade, valorUnitario, desconto)
// não devem vazar para o domínio.

describe("PrismaItemOrdemServicoMapper", () => {
  const rawBase = {
    id: "item-os-1",
    negocioId: "neg-1",
    ordemServicoId: "os-1",
    servicoId: "serv-1",
    descricao: "Polimento",
    status: "EM_EXECUCAO",
    responsavelId: "user-1",
    iniciadoEm: new Date("2026-01-01T11:00:00Z"),
    finalizadoEm: null,
    observacoes: "Em andamento",
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-01T11:00:00Z"),
    produtoId: "prod-legado",
    quantidade: 1,
    valorUnitario: { toString: () => "100" },
    desconto: null,
  };

  describe("toDomain", () => {
    it("converte os campos do domínio", () => {
      const item = PrismaItemOrdemServicoMapper.toDomain(rawBase as any);

      expect(item).toEqual(
        expect.objectContaining({
          id: "item-os-1",
          negocioId: "neg-1",
          ordemServicoId: "os-1",
          servicoId: "serv-1",
          descricao: "Polimento",
          status: "EM_EXECUCAO",
          responsavelId: "user-1",
          iniciadoEm: new Date("2026-01-01T11:00:00Z"),
        }),
      );
    });

    it("ignora campos comerciais legados", () => {
      const item = PrismaItemOrdemServicoMapper.toDomain(rawBase as any);

      expect(item).not.toHaveProperty("produtoId");
      expect(item).not.toHaveProperty("quantidade");
      expect(item).not.toHaveProperty("valorUnitario");
      expect(item).not.toHaveProperty("desconto");
    });

    it("mapeia status desconhecido para PENDENTE", () => {
      const item = PrismaItemOrdemServicoMapper.toDomain({
        ...rawBase,
        status: "INVALIDO",
      } as any);

      expect(item.status).toBe("PENDENTE");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco", () => {
      const item = ItemOrdemServico.reconstituir({
        id: "item-os-1",
        negocioId: "neg-1",
        ordemServicoId: "os-1",
        servicoId: "serv-1",
        descricao: "Polimento",
        status: "EM_EXECUCAO",
        responsavelId: "user-1",
        iniciadoEm: new Date("2026-01-01T11:00:00Z"),
        finalizadoEm: null,
        observacoes: "Em andamento",
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-01T11:00:00Z"),
      });

      const data = PrismaItemOrdemServicoMapper.toPrisma(item.toProps());

      expect(data).toEqual({
        id: "item-os-1",
        negocioId: "neg-1",
        ordemServicoId: "os-1",
        servicoId: "serv-1",
        descricao: "Polimento",
        status: "EM_EXECUCAO",
        responsavelId: "user-1",
        iniciadoEm: new Date("2026-01-01T11:00:00Z"),
        finalizadoEm: null,
        observacoes: "Em andamento",
        criadoEm: item.criadoEm,
        atualizadoEm: item.atualizadoEm,
      });
    });
  });
});
