import { ConsumoInsumoServico } from "../../../../Domain";
import { PrismaConsumoInsumoServicoMapper } from "./prisma-consumo-insumo-servico.mapper";

// PrismaConsumoInsumoServicoMapper.spec — valida a conversão da entidade
// ConsumoInsumoServico entre Prisma e domínio (inclui Decimal quantidade).

describe("PrismaConsumoInsumoServicoMapper", () => {
  const rawBase = {
    id: "consumo-1",
    negocioId: "neg-1",
    servicoId: "serv-1",
    produtoId: "prod-1",
    quantidade: { toString: () => "0.5" },
    unidadeMedida: "LITRO",
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte todos os campos e o Decimal de quantidade", () => {
      const consumo = PrismaConsumoInsumoServicoMapper.toDomain(rawBase as any);

      expect(consumo).toBeInstanceOf(ConsumoInsumoServico);
      expect(consumo.id).toBe("consumo-1");
      expect(consumo.negocioId).toBe("neg-1");
      expect(consumo.servicoId).toBe("serv-1");
      expect(consumo.produtoId).toBe("prod-1");
      expect(consumo.quantidade).toBe(0.5);
      expect(consumo.unidadeMedida).toBe("LITRO");
    });

    it("converte unidade de medida inválida para o default", () => {
      const consumo = PrismaConsumoInsumoServicoMapper.toDomain({
        ...rawBase,
        unidadeMedida: "INVALIDO",
      } as any);

      expect(consumo.unidadeMedida).toBe("UNIDADE");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco", () => {
      const consumo = ConsumoInsumoServico.reconstituir({
        id: "consumo-1",
        negocioId: "neg-1",
        servicoId: "serv-1",
        produtoId: "prod-1",
        quantidade: 0.5,
        unidadeMedida: "LITRO",
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-02T10:00:00Z"),
      });

      const data = PrismaConsumoInsumoServicoMapper.toPrisma(consumo);

      expect(data).toEqual({
        id: "consumo-1",
        negocioId: "neg-1",
        servicoId: "serv-1",
        produtoId: "prod-1",
        quantidade: 0.5,
        unidadeMedida: "LITRO",
        criadoEm: consumo.criadoEm,
        atualizadoEm: consumo.atualizadoEm,
      });
    });
  });
});
