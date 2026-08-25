import { ChecklistVeiculo } from "./checklist_veiculo";
import { OperacaoError } from "./OperacaoError";

describe("ChecklistVeiculo", () => {
  function criarChecklist(
    overrides: Partial<Parameters<typeof ChecklistVeiculo.criar>[0]> = {},
  ) {
    return ChecklistVeiculo.criar({
      negocioId: "neg-1",
      ordemServicoId: "os-1",
      veiculoId: "vei-1",
      itens: [
        { descricao: "Pintura conferida" },
        { descricao: "Rodas conferidas", marcado: true },
      ],
      ...overrides,
    });
  }

  it("cria checklist com itens e ids gerados", () => {
    const checklist = criarChecklist();

    expect(checklist.id).toBeTruthy();
    expect(checklist.negocioId).toBe("neg-1");
    expect(checklist.ordemServicoId).toBe("os-1");
    expect(checklist.veiculoId).toBe("vei-1");
    expect(checklist.itens).toHaveLength(2);
    expect(checklist.itens[0].descricao).toBe("Pintura conferida");
    expect(checklist.itens[0].marcado).toBe(false); // default
    expect(checklist.itens[0].id).toBeTruthy();
    expect(checklist.itens[1].marcado).toBe(true);
  });

  it("exige ao menos um item e campos obrigatórios", () => {
    expect(() => criarChecklist({ itens: [] })).toThrow(OperacaoError);
    expect(() =>
      criarChecklist({ itens: [{ descricao: "  " }] }),
    ).toThrow(OperacaoError);
    expect(() =>
      criarChecklist({ ordemServicoId: undefined as unknown as string }),
    ).toThrow(OperacaoError);
  });

  it("marcarItem atualiza o item", () => {
    const checklist = criarChecklist();
    const itemId = checklist.itens[0].id;

    checklist.marcarItem(itemId, true);

    expect(checklist.itens[0].marcado).toBe(true);
    expect(() => checklist.marcarItem("nao-existe", true)).toThrow(
      OperacaoError,
    );
  });
});
