import { PrismaAceiteOrcamentoMapper } from "./prisma-aceite-orcamento.mapper";

// PrismaAceiteOrcamentoMapper.spec — valida a conversão do AceiteOrcamento
// entre Prisma e domínio (campos de decisão, canal e status).

describe("PrismaAceiteOrcamentoMapper", () => {
  const rawBase = {
    id: "aceite-1",
    negocioId: "neg-1",
    orcamentoId: "orc-1",
    clienteId: "cli-1",
    status: "ACEITO",
    canal: "WHATSAPP",
    assinatura: "assinatura-legada",
    aceitoEm: new Date("2026-01-03T10:00:00Z"),
    recusadoEm: null,
    observacoes: "Cliente aprovou",
    enviadoEm: null,
    expiradoEm: null,
    ip: "127.0.0.1",
    criadoEm: new Date("2026-01-02T10:00:00Z"),
    atualizadoEm: new Date("2026-01-03T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte os campos do domínio", () => {
      const aceite = PrismaAceiteOrcamentoMapper.toDomain(rawBase as any);

      expect(aceite.id).toBe("aceite-1");
      expect(aceite.negocioId).toBe("neg-1");
      expect(aceite.orcamentoId).toBe("orc-1");
      expect(aceite.clienteId).toBe("cli-1");
      expect(aceite.status).toBe("ACEITO");
      expect(aceite.canal).toBe("WHATSAPP");
      expect(aceite.aceitoEm?.toISOString()).toBe("2026-01-03T10:00:00.000Z");
      expect(aceite.recusadoEm).toBeNull();
      expect(aceite.observacoes).toBe("Cliente aprovou");
    });

    it("ignora campos legados (assinatura, enviadoEm, expiradoEm, ip)", () => {
      const aceite = PrismaAceiteOrcamentoMapper.toDomain(rawBase as any);

      expect(aceite).not.toHaveProperty("assinatura");
      expect(aceite).not.toHaveProperty("enviadoEm");
      expect(aceite).not.toHaveProperty("expiradoEm");
      expect(aceite).not.toHaveProperty("ip");
    });

    it("mapeia status desconhecido para PENDENTE", () => {
      const aceite = PrismaAceiteOrcamentoMapper.toDomain({
        ...rawBase,
        status: "INVALIDO",
      } as any);

      expect(aceite.status).toBe("PENDENTE");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco", () => {
      const data = PrismaAceiteOrcamentoMapper.toPrisma({
        id: "aceite-1",
        negocioId: "neg-1",
        orcamentoId: "orc-1",
        clienteId: "cli-1",
        status: "ACEITO",
        canal: "WHATSAPP",
        aceitoEm: new Date("2026-01-03T10:00:00Z"),
        recusadoEm: null,
        observacoes: "Cliente aprovou",
        criadoEm: new Date("2026-01-02T10:00:00Z"),
        atualizadoEm: new Date("2026-01-03T10:00:00Z"),
      });

      expect(data).toEqual({
        id: "aceite-1",
        negocioId: "neg-1",
        orcamentoId: "orc-1",
        clienteId: "cli-1",
        status: "ACEITO",
        canal: "WHATSAPP",
        aceitoEm: new Date("2026-01-03T10:00:00Z"),
        recusadoEm: null,
        observacoes: "Cliente aprovou",
        criadoEm: new Date("2026-01-02T10:00:00Z"),
        atualizadoEm: new Date("2026-01-03T10:00:00Z"),
      });
      expect(data).not.toHaveProperty("assinatura");
    });
  });
});
