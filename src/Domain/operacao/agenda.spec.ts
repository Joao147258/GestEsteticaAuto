import { Agenda } from "./agenda";
import { OperacaoError } from "./OperacaoError";
import { Agendamento } from "./agendamento";

describe("Agenda", () => {
  function criarAgenda(
    overrides: Partial<Parameters<typeof Agenda.criar>[0]> = {},
  ) {
    return Agenda.criar({
      negocioId: "neg-1",
      nome: "  Agenda principal  ",
      ...overrides,
    });
  }

  it("cria agenda ATIVA com nome normalizado", () => {
    const agenda = criarAgenda();

    expect(agenda.id).toBeTruthy();
    expect(agenda.negocioId).toBe("neg-1");
    expect(agenda.nome).toBe("Agenda principal");
    expect(agenda.ativa).toBe(true);
    expect(agenda.agendamentos).toHaveLength(0);
  });

  it("valida negócio e nome obrigatórios", () => {
    expect(() => criarAgenda({ negocioId: "  " })).toThrow(OperacaoError);
    expect(() => criarAgenda({ nome: "  " })).toThrow(OperacaoError);
  });

  it("adicionarAgendamento e ativar/inativar", () => {
    const agenda = criarAgenda();
    const agendamento = Agendamento.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      inicio: new Date("2026-09-10T09:00:00"),
    });

    agenda.adicionarAgendamento(agendamento.toProps());
    expect(agenda.agendamentos).toHaveLength(1);

    agenda.inativar();
    expect(agenda.ativa).toBe(false);
    expect(() =>
      agenda.adicionarAgendamento(agendamento.toProps()),
    ).toThrow(OperacaoError);

    agenda.ativar();
    expect(agenda.ativa).toBe(true);
  });
});
