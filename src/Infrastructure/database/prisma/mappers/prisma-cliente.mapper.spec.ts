import { Cliente } from "../../../../Domain";
import { PrismaClienteMapper } from "./prisma-cliente.mapper";

// PrismaClienteMapper.spec — valida a conversão bidirecional entre o formato
// do banco (Prisma) e a entidade do domínio. Sem banco: apenas objetos.

describe("PrismaClienteMapper", () => {
  const rawBase = {
    id: "cli-1",
    negocioId: "neg-1",
    nome: "João",
    tipoPessoa: "PESSOA_FISICA" as const,
    cpfCnpj: "12345678901",
    email: "joao@email.com",
    telefone: "11999999999",
    status: "ATIVO",
    observacoes: null,
    origemId: null,
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-02T10:00:00Z"),
  };

  describe("toDomain", () => {
    it("converte todos os campos principais", () => {
      const cliente = PrismaClienteMapper.toDomain(rawBase as any);

      expect(cliente).toBeInstanceOf(Cliente);
      expect(cliente.id).toBe("cli-1");
      expect(cliente.negocioId).toBe("neg-1");
      expect(cliente.nome).toBe("João");
      expect(cliente.tipo).toBe("PESSOA_FISICA");
      expect(cliente.documento).toBe("12345678901");
      expect(cliente.email).toBe("joao@email.com");
      expect(cliente.telefone).toBe("11999999999");
      expect(cliente.status).toBe("ATIVO");
    });

    it("converte null do banco em null no domínio", () => {
      const cliente = PrismaClienteMapper.toDomain({
        ...rawBase,
        cpfCnpj: null,
        email: null,
        telefone: null,
      } as any);

      expect(cliente.documento).toBeNull();
      expect(cliente.email).toBeNull();
      expect(cliente.telefone).toBeNull();
    });

    it("preserva status INATIVO", () => {
      const cliente = PrismaClienteMapper.toDomain({
        ...rawBase,
        status: "INATIVO",
      } as any);

      expect(cliente.status).toBe("INATIVO");
    });

    it("preserva datas como Date", () => {
      const cliente = PrismaClienteMapper.toDomain(rawBase as any);

      expect(cliente.criadoEm).toBeInstanceOf(Date);
      expect(cliente.atualizadoEm).toBeInstanceOf(Date);
      expect(cliente.criadoEm.toISOString()).toBe("2026-01-01T10:00:00.000Z");
    });
  });

  describe("toPrisma", () => {
    it("converte a entidade de volta para o formato do banco", () => {
      const cliente = Cliente.reconstituir({
        id: "cli-1",
        negocioId: "neg-1",
        nome: "João",
        tipo: "PESSOA_FISICA",
        documento: "12345678901",
        email: "joao@email.com",
        telefone: "11999999999",
        status: "ATIVO",
        observacoes: null,
        origemId: null,
        contatos: [],
        enderecos: [],
        preferencias: [],
        tags: [],
        anexos: [],
        alteracoes: [],
        criadoEm: new Date("2026-01-01T10:00:00Z"),
        atualizadoEm: new Date("2026-01-02T10:00:00Z"),
      });

      const data = PrismaClienteMapper.toPrisma(cliente);

      expect(data).toEqual({
        id: "cli-1",
        negocioId: "neg-1",
        nome: "João",
        tipoPessoa: "PESSOA_FISICA",
        cpfCnpj: "12345678901",
        email: "joao@email.com",
        telefone: "11999999999",
        status: "ATIVO",
        observacoes: null,
        origemId: null,
        criadoEm: cliente.criadoEm,
        atualizadoEm: cliente.atualizadoEm,
      });
    });

    it("normaliza undefined do domínio para null no banco", () => {
      const cliente = Cliente.reconstituir({
        id: "cli-2",
        negocioId: "neg-1",
        nome: "Maria",
        tipo: "PESSOA_JURIDICA",
        status: "ATIVO",
        contatos: [],
        enderecos: [],
        preferencias: [],
        tags: [],
        anexos: [],
        alteracoes: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });

      const data = PrismaClienteMapper.toPrisma(cliente);

      expect(data.cpfCnpj).toBeNull();
      expect(data.email).toBeNull();
      expect(data.telefone).toBeNull();
      expect(data.observacoes).toBeNull();
      expect(data.origemId).toBeNull();
    });
  });
});
