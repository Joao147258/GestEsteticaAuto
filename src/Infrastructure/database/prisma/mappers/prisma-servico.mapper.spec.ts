import { Servico } from "../../../../Domain";
import { PrismaServicoMapper } from "./prisma-servico.mapper";

// PrismaServicoMapper.spec — valida a conversão bidirecional do Servico
// entre o formato Prisma e o domínio, incluindo os nomes divergentes
// (categoriaServicoId ↔ categoriaId, duracaoMinutos ↔ duracaoEstimadaMinutos).

describe("PrismaServicoMapper", () => {
  const rawBase = {
    id: "serv-1",
    negocioId: "neg-1",
    categoriaServicoId: "cat-1",
    nome: "Polimento",
    descricao: "Polimento técnico",
    precoBase: { toString: () => "199.9" },
    duracaoMinutos: 120,
    observacoes: "Observação",
    status: "ATIVO",
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte os campos com nomes divergentes corretamente", () => {
      const servico = PrismaServicoMapper.toDomain(rawBase as any);

      expect(servico).toBeInstanceOf(Servico);
      expect(servico.id).toBe("serv-1");
      expect(servico.categoriaId).toBe("cat-1");
      expect(servico.nome).toBe("Polimento");
      expect(servico.precoBase).toBe(199.9);
      expect(servico.duracaoEstimadaMinutos).toBe(120);
      expect(servico.observacoes).toBe("Observação");
      expect(servico.status).toBe("ATIVO");
    });

    it("normaliza null do banco em null no domínio", () => {
      const servico = PrismaServicoMapper.toDomain({
        ...rawBase,
        categoriaServicoId: null,
        descricao: null,
        duracaoMinutos: null,
        observacoes: null,
      } as any);

      expect(servico.categoriaId).toBeNull();
      expect(servico.descricao).toBeNull();
      expect(servico.duracaoEstimadaMinutos).toBeNull();
      expect(servico.observacoes).toBeNull();
    });

    it("assume precoBase 0 quando o banco guarda null (dado legado)", () => {
      const servico = PrismaServicoMapper.toDomain({
        ...rawBase,
        precoBase: null,
      } as any);

      expect(servico.precoBase).toBe(0);
    });
  });

  describe("toPrisma", () => {
    it("converte de volta usando os nomes do banco", () => {
      const servico = Servico.reconstituir({
        id: "serv-1",
        negocioId: "neg-1",
        nome: "Polimento",
        descricao: "Polimento técnico",
        categoriaId: "cat-1",
        precoBase: 199.9,
        duracaoEstimadaMinutos: 120,
        status: "ATIVO",
        observacoes: "Observação",
        alteracoes: [],
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-02T10:00:00Z"),
      });

      const data = PrismaServicoMapper.toPrisma(servico);

      expect(data).toEqual({
        id: "serv-1",
        negocioId: "neg-1",
        categoriaServicoId: "cat-1",
        nome: "Polimento",
        descricao: "Polimento técnico",
        precoBase: 199.9,
        duracaoMinutos: 120,
        observacoes: "Observação",
        status: "ATIVO",
        criadoEm: servico.criadoEm,
        atualizadoEm: servico.atualizadoEm,
      });
    });
  });
});
