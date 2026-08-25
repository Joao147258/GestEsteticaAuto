import { OrdemServico } from "./ordem_servico";
import { OperacaoError } from "./OperacaoError";

describe("OrdemServico", () => {
  function criarOrdem(
    overrides: Partial<Parameters<typeof OrdemServico.criar>[0]> = {},
  ) {
    return OrdemServico.criar({
      negocioId: "neg-1",
      clienteId: "cli-1",
      veiculoId: "vei-1",
      orcamentoId: "orc-1",
      ...overrides,
    });
  }

  function adicionarItens(ordem: OrdemServico): string[] {
    const id1 = ordem.adicionarItem({
      servicoId: "serv-1",
      descricao: "Lavagem detalhada",
    });
    const id2 = ordem.adicionarItem({
      servicoId: "serv-2",
      descricao: "Higienização interna",
    });
    return [id1, id2];
  }

  describe("criar", () => {
    it("cria ordem ABERTA com histórico vazio", () => {
      const ordem = criarOrdem();

      expect(ordem.id).toBeTruthy();
      expect(ordem.negocioId).toBe("neg-1");
      expect(ordem.clienteId).toBe("cli-1");
      expect(ordem.veiculoId).toBe("vei-1");
      expect(ordem.orcamentoId).toBe("orc-1");
      expect(ordem.status).toBe("ABERTA");
      expect(ordem.itens).toHaveLength(0);
      expect(ordem.fotos).toHaveLength(0);
      expect(ordem.observacoesTecnicas).toHaveLength(0);
      expect(ordem.inspecaoEntrada).toBeNull();
      expect(ordem.checklist).toBeNull();
      expect(ordem.alteracoes).toHaveLength(0);
      expect(ordem.abertaEm).toBeInstanceOf(Date);
    });

    it("valida negócio, cliente e veículo obrigatórios", () => {
      expect(() =>
        OrdemServico.criar({ negocioId: "", clienteId: "c", veiculoId: "v" }),
      ).toThrow(OperacaoError);
      expect(() =>
        OrdemServico.criar({ negocioId: "n", clienteId: "", veiculoId: "v" }),
      ).toThrow(OperacaoError);
      expect(() =>
        OrdemServico.criar({ negocioId: "n", clienteId: "c", veiculoId: "" }),
      ).toThrow(OperacaoError);
    });
  });

  describe("itens", () => {
    it("adicionar e remover itens apenas antes da execução", () => {
      const ordem = criarOrdem();
      const [id1] = adicionarItens(ordem);

      expect(ordem.itens).toHaveLength(2);
      expect(ordem.itens[0].descricao).toBe("Lavagem detalhada");
      expect(ordem.itens[0].status).toBe("PENDENTE");

      ordem.removerItem(id1);
      expect(ordem.itens).toHaveLength(1);

      expect(() => ordem.removerItem("nao-existe")).toThrow(OperacaoError);
    });

    it("não permite adicionar item após iniciar execução", () => {
      const ordem = criarOrdem();
      adicionarItens(ordem);
      ordem.iniciar();

      expect(() =>
        ordem.adicionarItem({ servicoId: "serv-3", descricao: "Extra" }),
      ).toThrow(OperacaoError);
    });

    it("iniciarItem e concluirItem controlam a execução individual", () => {
      const ordem = criarOrdem();
      const [id1] = adicionarItens(ordem);
      ordem.iniciar();

      ordem.iniciarItem(id1);
      expect(ordem.itens[0].status).toBe("EM_EXECUCAO");

      ordem.concluirItem(id1);
      expect(ordem.itens[0].status).toBe("CONCLUIDO");
      expect(ordem.itens[0].finalizadoEm).toBeInstanceOf(Date);
    });
  });

  describe("ciclo de vida", () => {
    it("aguardarVeiculo e iniciar", () => {
      const ordem = criarOrdem();
      ordem.aguardarVeiculo();
      expect(ordem.status).toBe("AGUARDANDO_VEICULO");

      ordem.iniciar();
      expect(ordem.status).toBe("EM_EXECUCAO");
      expect(ordem.iniciadaEm).toBeInstanceOf(Date);
    });

    it("pausar e retomar", () => {
      const ordem = criarOrdem();
      adicionarItens(ordem);
      ordem.iniciar();

      ordem.pausar();
      expect(ordem.status).toBe("PAUSADA");
      expect(ordem.pausadaEm).toBeInstanceOf(Date);

      ordem.retomar();
      expect(ordem.status).toBe("EM_EXECUCAO");
      expect(ordem.pausadaEm).toBeNull();
    });

    it("concluir exige todos os itens finalizados", () => {
      const ordem = criarOrdem();
      const [id1, id2] = adicionarItens(ordem);
      ordem.iniciar();

      expect(() => ordem.concluir()).toThrow(OperacaoError); // itens pendentes

      ordem.concluirItem(id1);
      ordem.concluirItem(id2);
      ordem.concluir();

      expect(ordem.status).toBe("CONCLUIDA");
      expect(ordem.finalizadaEm).toBeInstanceOf(Date);
    });

    it("cancelar a partir de ABERTA", () => {
      const ordem = criarOrdem();
      ordem.cancelar({ descricao: "cliente desistiu" });

      expect(ordem.status).toBe("CANCELADA");
      expect(ordem.canceladaEm).toBeInstanceOf(Date);
    });

    it("não permite concluir ordem sem itens nem cancelar ordem concluída", () => {
      const ordem = criarOrdem();
      expect(() => ordem.concluir()).toThrow(OperacaoError);

      const ordem2 = criarOrdem();
      const [id1, id2] = adicionarItens(ordem2);
      ordem2.iniciar();
      ordem2.concluirItem(id1);
      ordem2.concluirItem(id2);
      ordem2.concluir();

      expect(ordem2.status).toBe("CONCLUIDA");
      expect(() => ordem2.cancelar()).toThrow(OperacaoError);
    });
  });

  describe("registros operacionais", () => {
    it("registrarInspecaoEntrada pertence à ordem", () => {
      const ordem = criarOrdem();
      ordem.registrarInspecaoEntrada({
        quilometragem: 50000,
        avarias: ["risco no para-choque"],
      });

      expect(ordem.inspecaoEntrada?.ordemServicoId).toBe(ordem.id);
      expect(ordem.inspecaoEntrada?.veiculoId).toBe("vei-1");
      expect(ordem.inspecaoEntrada?.quilometragem).toBe(50000);
    });

    it("adicionarChecklist pertence à ordem", () => {
      const ordem = criarOrdem();
      ordem.adicionarChecklist({
        itens: [{ descricao: "Pintura conferida" }],
      });

      expect(ordem.checklist?.ordemServicoId).toBe(ordem.id);
      expect(ordem.checklist?.veiculoId).toBe("vei-1");
      expect(ordem.checklist?.itens).toHaveLength(1);
    });

    it("adicionarFoto e adicionarObservacaoTecnica pertencem à ordem", () => {
      const ordem = criarOrdem();
      ordem.adicionarFoto({
        tipo: "ENTRADA",
        url: "https://storage/foto.jpg",
      });
      ordem.adicionarObservacaoTecnica({
        tipo: "ALERTA",
        descricao: "pintura muito contaminada",
      });

      expect(ordem.fotos).toHaveLength(1);
      expect(ordem.fotos[0].ordemServicoId).toBe(ordem.id);
      expect(ordem.fotos[0].tipo).toBe("ENTRADA");
      expect(ordem.observacoesTecnicas).toHaveLength(1);
      expect(ordem.observacoesTecnicas[0].tipo).toBe("ALERTA");
    });

    it("ordem encerrada não aceita novos registros", () => {
      const ordem = criarOrdem();
      ordem.cancelar();

      expect(() =>
        ordem.adicionarFoto({ tipo: "ENTRADA", url: "https://x" }),
      ).toThrow(OperacaoError);
      expect(() =>
        ordem.adicionarObservacaoTecnica({
          tipo: "INFORMATIVA",
          descricao: "obs",
        }),
      ).toThrow(OperacaoError);
    });

    it("registra histórico de alterações", () => {
      const ordem = criarOrdem();
      adicionarItens(ordem);
      ordem.iniciar();

      const statusAlteracao = ordem.alteracoes.find((a) => a.campo === "status");
      expect(statusAlteracao?.valorAnterior).toBe("ABERTA");
      expect(statusAlteracao?.valorNovo).toBe("EM_EXECUCAO");
    });
  });
});
