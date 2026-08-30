import { OrdemServico } from "../../../../Domain/operacao";
import { PrismaOrdemServicoMapper } from "./prisma-ordem-servico.mapper";

// PrismaOrdemServicoMapper.spec — valida a reconstrução da OS com itens e
// timestamps de ciclo de vida. Na V1, inspeção/checklist/fotos/observações
// não são reconstruídos (ficam vazios).

describe("PrismaOrdemServicoMapper", () => {
  const rawBase = {
    id: "os-1",
    negocioId: "neg-1",
    clienteId: "cli-1",
    veiculoId: "vei-1",
    orcamentoId: "orc-1",
    agendamentoId: null,
    numero: "OS-001",
    status: "EM_EXECUCAO",
    observacoes: "Executando",
    abertaEm: new Date("2026-01-01T10:00:00Z"),
    iniciadaEm: new Date("2026-01-01T11:00:00Z"),
    pausadaEm: null,
    finalizadaEm: null,
    canceladaEm: null,
    previsaoInicio: new Date("2026-01-01T10:00:00Z"),
    previsaoConclusao: new Date("2026-01-01T14:00:00Z"),
    criadoEm: new Date("2026-01-01T10:00:00Z"),
    atualizadoEm: new Date("2026-01-01T11:00:00Z"),
  };

  const itemRaw = {
    id: "item-1",
    negocioId: "neg-1",
    ordemServicoId: "os-1",
    servicoId: "serv-1",
    descricao: "Polimento",
    status: "EM_EXECUCAO",
    responsavelId: null,
    iniciadoEm: null,
    finalizadoEm: null,
    observacoes: null,
    criadoEm: new Date("2026-01-01T10:30:00Z"),
    atualizadoEm: new Date("2026-01-01T10:30:00Z"),
  };

  describe("toDomain", () => {
    it("reconstrói a OS com itens e timestamps", () => {
      const os = PrismaOrdemServicoMapper.toDomain({
        ...rawBase,
        itens: [itemRaw],
      } as any);

      expect(os).toBeInstanceOf(OrdemServico);
      expect(os.id).toBe("os-1");
      expect(os.status).toBe("EM_EXECUCAO");
      expect(os.iniciadaEm?.toISOString()).toBe("2026-01-01T11:00:00.000Z");
      expect(os.previsaoConclusao?.toISOString()).toBe("2026-01-01T14:00:00.000Z");
      expect(os.itens).toHaveLength(1);
      expect(os.itens[0].descricao).toBe("Polimento");
    });

    it("deixa inspeção/checklist/fotos/observações vazios na V1", () => {
      const os = PrismaOrdemServicoMapper.toDomain({
        ...rawBase,
        itens: [],
      } as any);

      expect(os.inspecaoEntrada).toBeNull();
      expect(os.checklist).toBeNull();
      expect(os.fotos).toHaveLength(0);
      expect(os.observacoesTecnicas).toHaveLength(0);
    });

    it("mapeia status desconhecido para ABERTA", () => {
      const os = PrismaOrdemServicoMapper.toDomain({
        ...rawBase,
        status: "INVALIDO",
        itens: [],
      } as any);

      expect(os.status).toBe("ABERTA");
    });
  });

  describe("toPrisma", () => {
    it("converte de volta para o formato do banco", () => {
      const os = PrismaOrdemServicoMapper.toDomain({
        ...rawBase,
        itens: [itemRaw],
      } as any);

      const data = PrismaOrdemServicoMapper.toPrisma(os);

      expect(data).toEqual({
        id: "os-1",
        negocioId: "neg-1",
        clienteId: "cli-1",
        veiculoId: "vei-1",
        orcamentoId: "orc-1",
        agendamentoId: null,
        numero: "OS-001",
        responsavelId: null,
        status: "EM_EXECUCAO",
        observacoes: "Executando",
        abertaEm: new Date("2026-01-01T10:00:00Z"),
        iniciadaEm: new Date("2026-01-01T11:00:00Z"),
        pausadaEm: null,
        finalizadaEm: null,
        canceladaEm: null,
        previsaoInicio: new Date("2026-01-01T10:00:00Z"),
        previsaoConclusao: new Date("2026-01-01T14:00:00Z"),
        criadoEm: os.criadoEm,
        atualizadoEm: os.atualizadoEm,
      });
    });
  });
});
