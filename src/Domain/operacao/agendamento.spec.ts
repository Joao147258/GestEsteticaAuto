import { Agendamento } from "./agendamento";
import { OperacaoError } from "./OperacaoError";

describe("Agendamento", () => {
  function criarAgendamento(
    overrides: Partial<Parameters<typeof Agendamento.criar>[0]> = {},
  ) {
    return Agendamento.criar({
      negocioId: "neg-1",
      agendaId: "agenda-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      inicio: new Date("2026-09-10T09:00:00"),
      duracaoEstimadaMinutos: 120,
      ...overrides,
    });
  }

  it("cria agendamento AGENDADO", () => {
    const agendamento = criarAgendamento();

    expect(agendamento.id).toBeTruthy();
    expect(agendamento.negocioId).toBe("neg-1");
    expect(agendamento.agendaId).toBe("agenda-1");
    expect(agendamento.clienteId).toBe("cli-1");
    expect(agendamento.veiculoId).toBe("vei-1");
    expect(agendamento.status).toBe("AGENDADO");
    expect(agendamento.inicio).toEqual(new Date("2026-09-10T09:00:00"));
    expect(agendamento.duracaoEstimadaMinutos).toBe(120);
  });

  it("valida negócio, cliente, início e duração", () => {
    expect(() =>
      criarAgendamento({ negocioId: "  " }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarAgendamento({ clienteId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarAgendamento({ inicio: undefined as unknown as Date }),
    ).toThrow(OperacaoError);
    expect(() => criarAgendamento({ duracaoEstimadaMinutos: -1 })).toThrow(
      OperacaoError,
    );
  });

  it("ciclo: confirmar → iniciarAtendimento → concluir", () => {
    const agendamento = criarAgendamento();

    agendamento.confirmar();
    expect(agendamento.status).toBe("CONFIRMADO");

    agendamento.iniciarAtendimento();
    expect(agendamento.status).toBe("EM_ATENDIMENTO");

    agendamento.concluir();
    expect(agendamento.status).toBe("CONCLUIDO");
    expect(agendamento.fim).toBeInstanceOf(Date);
  });

  it("cancelar a partir de AGENDADO/CONFIRMADO", () => {
    const agendamento = criarAgendamento();
    agendamento.cancelar("Cliente desmarcou");

    expect(agendamento.status).toBe("CANCELADO");
    expect(agendamento.observacoes).toBe("Cliente desmarcou");
  });

  it("não permite cancelar agendamento concluído", () => {
    const agendamento = criarAgendamento();
    agendamento.confirmar();
    agendamento.iniciarAtendimento();
    agendamento.concluir();

    expect(() => agendamento.cancelar()).toThrow(OperacaoError);
  });

  it("registrarNaoComparecimento", () => {
    const agendamento = criarAgendamento();
    agendamento.registrarNaoComparecimento();

    expect(agendamento.status).toBe("NAO_COMPARECEU");
  });

  it("alterarHorario e vincularOrdemServico", () => {
    const agendamento = criarAgendamento();
    const novoInicio = new Date("2026-09-11T14:00:00");

    agendamento.alterarHorario(novoInicio, 90);
    agendamento.vincularOrdemServico("os-1");

    expect(agendamento.inicio).toEqual(novoInicio);
    expect(agendamento.duracaoEstimadaMinutos).toBe(90);
    expect(agendamento.ordemServicoId).toBe("os-1");
  });
});
