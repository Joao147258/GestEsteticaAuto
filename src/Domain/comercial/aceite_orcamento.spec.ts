import { AceiteOrcamento } from "./aceite_orcamento";
import { ComercialError } from "./ComercialError";

describe("AceiteOrcamento", () => {
  function criarAceite(
    overrides: Partial<Parameters<typeof AceiteOrcamento.criar>[0]> = {},
  ) {
    return AceiteOrcamento.criar({
      negocioId: "neg-1",
      orcamentoId: "orc-1",
      clienteId: "cli-1",
      ...overrides,
    });
  }

  it("cria aceite com status PENDENTE", () => {
    const aceite = criarAceite();

    expect(aceite.id).toBeTruthy();
    expect(aceite.negocioId).toBe("neg-1");
    expect(aceite.orcamentoId).toBe("orc-1");
    expect(aceite.clienteId).toBe("cli-1");
    expect(aceite.status).toBe("PENDENTE");
    expect(aceite.aceitoEm).toBeNull();
    expect(aceite.recusadoEm).toBeNull();
  });

  it("valida campos obrigatórios", () => {
    expect(() =>
      criarAceite({ negocioId: undefined as unknown as string }),
    ).toThrow(ComercialError);
    expect(() =>
      criarAceite({ orcamentoId: undefined as unknown as string }),
    ).toThrow(ComercialError);
    expect(() =>
      criarAceite({ clienteId: undefined as unknown as string }),
    ).toThrow(ComercialError);
  });

  it("registrarAceite marca ACEITO com data e canal", () => {
    const aceite = criarAceite();
    aceite.registrarAceite("WHATSAPP", "Cliente aceitou");

    expect(aceite.status).toBe("ACEITO");
    expect(aceite.aceitoEm).toBeInstanceOf(Date);
    expect(aceite.canal).toBe("WHATSAPP");
    expect(aceite.observacoes).toBe("Cliente aceitou");
  });

  it("registrarRecusa marca RECUSADO", () => {
    const aceite = criarAceite();
    aceite.registrarRecusa("PRESENCIAL");

    expect(aceite.status).toBe("RECUSADO");
    expect(aceite.recusadoEm).toBeInstanceOf(Date);
  });

  it("cancelar marca CANCELADO", () => {
    const aceite = criarAceite();
    aceite.cancelar();

    expect(aceite.status).toBe("CANCELADO");
  });

  it("não permite transição a partir de estado final", () => {
    const aceite = criarAceite();
    aceite.registrarAceite();

    expect(() => aceite.registrarRecusa()).toThrow(ComercialError);
    expect(() => aceite.cancelar()).toThrow(ComercialError);
  });
});
