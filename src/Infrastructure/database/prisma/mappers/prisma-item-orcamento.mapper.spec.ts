import { PrismaItemOrcamentoMapper } from "./prisma-item-orcamento.mapper";

// PrismaItemOrcamentoMapper.spec — valida a derivação tipo/referenciaId a
// partir de servicoId/produtoId (decisão do projeto) e a volta sem os dois
// campos preenchidos ao mesmo tempo.

describe("PrismaItemOrcamentoMapper", () => {
  const rawBase = {
    id: "item-1",
    negocioId: "neg-1",
    orcamentoId: "orc-1",
    descricao: "Polimento",
    quantidade: { toString: () => "2.5" },
    valorUnitario: { toString: () => "100.0" },
    valorTotal: { toString: () => "250.0" },
    desconto: null,
    observacoes: null,
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("deriva tipo SERVICO e referenciaId de servicoId", () => {
      const item = PrismaItemOrcamentoMapper.toDomain({
        ...rawBase,
        servicoId: "serv-1",
        produtoId: null,
        tipo: "SERVICO",
      } as any);

      expect(item.tipo).toBe("SERVICO");
      expect(item.referenciaId).toBe("serv-1");
      expect(item.quantidade).toBe(2.5);
      expect(item.valorTotal).toBe(250.0);
    });

    it("deriva tipo PRODUTO e referenciaId de produtoId", () => {
      const item = PrismaItemOrcamentoMapper.toDomain({
        ...rawBase,
        servicoId: null,
        produtoId: "prod-1",
        tipo: "PRODUTO",
      } as any);

      expect(item.tipo).toBe("PRODUTO");
      expect(item.referenciaId).toBe("prod-1");
    });

    it("converte Decimal em number", () => {
      const item = PrismaItemOrcamentoMapper.toDomain({
        ...rawBase,
        servicoId: "serv-1",
        produtoId: null,
        tipo: "SERVICO",
      } as any);

      expect(item.valorUnitario).toBe(100.0);
      expect(item.valorDesconto).toBe(0);
    });
  });

  describe("toPrisma", () => {
    it("mapeia SERVICO para servicoId e produtoId null", () => {
      const data = PrismaItemOrcamentoMapper.toPrisma({
        id: "item-1",
        negocioId: "neg-1",
        orcamentoId: "orc-1",
        tipo: "SERVICO",
        referenciaId: "serv-1",
        descricao: "Polimento",
        quantidade: 2.5,
        valorUnitario: 100,
        valorDesconto: 0,
        valorTotal: 250,
        observacoes: null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });

      expect(data.servicoId).toBe("serv-1");
      expect(data.produtoId).toBeNull();
    });

    it("mapeia PRODUTO para produtoId e servicoId null", () => {
      const data = PrismaItemOrcamentoMapper.toPrisma({
        id: "item-1",
        negocioId: "neg-1",
        orcamentoId: "orc-1",
        tipo: "PRODUTO",
        referenciaId: "prod-1",
        descricao: "Cera",
        quantidade: 1,
        valorUnitario: 50,
        valorDesconto: 0,
        valorTotal: 50,
        observacoes: null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });

      expect(data.produtoId).toBe("prod-1");
      expect(data.servicoId).toBeNull();
    });

    it("nunca preenche servicoId e produtoId ao mesmo tempo", () => {
      const data = PrismaItemOrcamentoMapper.toPrisma({
        id: "item-1",
        negocioId: "neg-1",
        orcamentoId: "orc-1",
        tipo: "PRODUTO",
        referenciaId: "prod-1",
        descricao: "Cera",
        quantidade: 1,
        valorUnitario: 50,
        valorDesconto: 0,
        valorTotal: 50,
        observacoes: null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });

      expect(data.servicoId).toBeNull();
      expect(data.produtoId).toBe("prod-1");
    });
  });
});
