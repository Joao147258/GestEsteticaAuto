import { Veiculo } from "../../../../Domain";
import { PrismaVeiculoMapper } from "./prisma-veiculo.mapper";

// PrismaVeiculoMapper.spec — valida a conversão bidirecional do Veiculo
// entre o formato Prisma e o domínio. Sem banco, apenas objetos.

describe("PrismaVeiculoMapper", () => {
  const rawBase = {
    id: "vei-1",
    negocioId: "neg-1",
    clienteId: "cli-1",
    placa: "ABC1D23",
    marca: "VW",
    modelo: "Gol",
    anoFabricacao: 2020,
    anoModelo: 2021,
    cor: "Prata",
    chassi: "9BWZZZ377VT004251",
    renavam: "1234567890",
    quilometragem: 45000,
    observacoes: null,
    status: "ATIVO",
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte todos os campos principais", () => {
      const veiculo = PrismaVeiculoMapper.toDomain(rawBase as any);

      expect(veiculo).toBeInstanceOf(Veiculo);
      expect(veiculo.id).toBe("vei-1");
      expect(veiculo.negocioId).toBe("neg-1");
      expect(veiculo.clienteId).toBe("cli-1");
      expect(veiculo.placa).toBe("ABC1D23");
      expect(veiculo.marca).toBe("VW");
      expect(veiculo.modelo).toBe("Gol");
      expect(veiculo.anoFabricacao).toBe(2020);
      expect(veiculo.quilometragem).toBe(45000);
      expect(veiculo.status).toBe("ATIVO");
    });

    it("converte campos opcionais null do banco em null no domínio", () => {
      const veiculo = PrismaVeiculoMapper.toDomain({
        ...rawBase,
        placa: null,
        marca: null,
        cor: null,
        renavam: null,
      } as any);

      expect(veiculo.placa).toBeNull();
      expect(veiculo.marca).toBeNull();
      expect(veiculo.cor).toBeNull();
      expect(veiculo.renavam).toBeNull();
    });

    it("preserva status INATIVO", () => {
      const veiculo = PrismaVeiculoMapper.toDomain({
        ...rawBase,
        status: "INATIVO",
      } as any);

      expect(veiculo.status).toBe("INATIVO");
    });

    it("preserva datas como Date", () => {
      const veiculo = PrismaVeiculoMapper.toDomain(rawBase as any);

      expect(veiculo.criadoEm).toBeInstanceOf(Date);
      expect(veiculo.criadoEm.toISOString()).toBe("2026-01-01T10:00:00.000Z");
    });
  });

  describe("toPrisma", () => {
    it("converte a entidade de volta para o formato do banco", () => {
      const veiculo = Veiculo.reconstituir({
        id: "vei-1",
        negocioId: "neg-1",
        clienteId: "cli-1",
        placa: "ABC1D23",
        marca: "VW",
        modelo: "Gol",
        anoFabricacao: 2020,
        anoModelo: 2021,
        cor: "Prata",
        chassi: "9BWZZZ377VT004251",
        renavam: "1234567890",
        quilometragem: 45000,
        observacoes: null,
        status: "ATIVO",
        alteracoes: [],
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-02T10:00:00Z"),
      });

      const data = PrismaVeiculoMapper.toPrisma(veiculo);

      expect(data).toEqual({
        id: "vei-1",
        negocioId: "neg-1",
        clienteId: "cli-1",
        placa: "ABC1D23",
        marca: "VW",
        modelo: "Gol",
        anoFabricacao: 2020,
        anoModelo: 2021,
        cor: "Prata",
        chassi: "9BWZZZ377VT004251",
        renavam: "1234567890",
        quilometragem: 45000,
        observacoes: null,
        status: "ATIVO",
        criadoEm: veiculo.criadoEm,
        atualizadoEm: veiculo.atualizadoEm,
      });
    });

    it("normaliza undefined do domínio para null no banco", () => {
      const veiculo = Veiculo.reconstituir({
        id: "vei-2",
        negocioId: "neg-1",
        clienteId: "cli-1",
        status: "ATIVO",
        alteracoes: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });

      const data = PrismaVeiculoMapper.toPrisma(veiculo);

      expect(data.placa).toBeNull();
      expect(data.marca).toBeNull();
      expect(data.modelo).toBeNull();
      expect(data.observacoes).toBeNull();
    });
  });
});
