import { EstoqueVenda } from "./estoque_venda";
import { EstoqueVendaError } from "./EstoqueVendaError";

describe("EstoqueVenda", () => {
  // Helper padrão: estoque de venda com 10 unidades, custo 20 e preço 35.
  function criarEstoque(
    overrides: Partial<Parameters<typeof EstoqueVenda.criar>[0]> = {},
  ) {
    return EstoqueVenda.criar({
      negocioId: "neg-1",
      produtoId: "prod-1",
      unidadeMedida: "UNIDADE",
      quantidadeInicial: 10,
      custoUnitario: 20,
      precoVenda: 35,
      ...overrides,
    });
  }

  describe("criar", () => {
    it("valida negócio, produto e unidade de medida obrigatórios", () => {
      expect(() =>
        EstoqueVenda.criar({ negocioId: "", produtoId: "p", unidadeMedida: "UNIDADE" }),
      ).toThrow(EstoqueVendaError);
      expect(() =>
        EstoqueVenda.criar({ negocioId: "n", produtoId: "", unidadeMedida: "UNIDADE" }),
      ).toThrow(EstoqueVendaError);
      expect(() =>
        EstoqueVenda.criar({
          negocioId: "n",
          produtoId: "p",
          unidadeMedida: undefined as unknown as "UNIDADE",
        }),
      ).toThrow(EstoqueVendaError);
    });

    it("lança EstoqueVendaError quando quantidade inicial é negativa", () => {
      expect(() => criarEstoque({ quantidadeInicial: -1 })).toThrow(
        EstoqueVendaError,
      );
    });

    it("cria com saldo inicial registrando movimentação ENTRADA", () => {
      const estoque = criarEstoque();
      expect(estoque.quantidadeAtual).toBe(10);
      expect(estoque.quantidadeReservada).toBe(0);
      expect(estoque.quantidadeDisponivel).toBe(10);
      expect(estoque.movimentacoes).toHaveLength(1);
      expect(estoque.movimentacoes[0].tipo).toBe("ENTRADA");
    });

    it("calcula margem unitária aproximada", () => {
      const estoque = criarEstoque();
      expect(estoque.margemUnitariaAproximada).toBe(15); // 35 - 20

      const semPreco = criarEstoque({ precoVenda: null });
      expect(semPreco.margemUnitariaAproximada).toBeNull();

      const semCusto = criarEstoque({ custoUnitario: null });
      expect(semCusto.margemUnitariaAproximada).toBeNull();
    });
  });

  describe("adicionarEntrada", () => {
    it("incrementa o saldo e registra ENTRADA", () => {
      const estoque = criarEstoque();
      estoque.adicionarEntrada(5, "Compra");

      expect(estoque.quantidadeAtual).toBe(15);
      expect(estoque.quantidadeDisponivel).toBe(15);
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("ENTRADA");
    });

    it("lança EstoqueVendaError quando quantidade é zero", () => {
      const estoque = criarEstoque();
      expect(() => estoque.adicionarEntrada(0)).toThrow(EstoqueVendaError);
    });
  });

  describe("reservarQuantidade", () => {
    it("reserva sem mudar o saldo físico e cria reserva ATIVA", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(3, "orc-1", "ORCAMENTO");

      expect(estoque.quantidadeAtual).toBe(10); // saldo físico não muda
      expect(estoque.quantidadeReservada).toBe(3);
      expect(estoque.quantidadeDisponivel).toBe(7);
      expect(estoque.reservas).toHaveLength(1);
      expect(estoque.reservas[0].status).toBe("ATIVA");
      expect(estoque.reservas[0].referenciaId).toBe("orc-1");
      expect(estoque.reservas[0].referenciaTipo).toBe("ORCAMENTO");
      const mov = estoque.movimentacoes.at(-1);
      expect(mov?.tipo).toBe("RESERVA");
      expect(mov?.quantidadeReservadaAnterior).toBe(0);
      expect(mov?.quantidadeReservadaNova).toBe(3);
    });

    it("lança EstoqueVendaError ao reservar acima do disponível", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(8);
      expect(() => estoque.reservarQuantidade(3)).toThrow(EstoqueVendaError);
    });
  });

  describe("cancelarReserva", () => {
    it("cancela reserva ativa e devolve ao disponível", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(3, "orc-1", "ORCAMENTO");
      const reservaId = estoque.reservas[0].id;

      estoque.cancelarReserva(reservaId, "Cliente desistiu");

      expect(estoque.quantidadeAtual).toBe(10);
      expect(estoque.quantidadeReservada).toBe(0);
      expect(estoque.quantidadeDisponivel).toBe(10);
      expect(estoque.reservas[0].status).toBe("CANCELADA");
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("CANCELAMENTO_RESERVA");
    });

    it("lança EstoqueVendaError para reserva inexistente", () => {
      const estoque = criarEstoque();
      expect(() => estoque.cancelarReserva("nao-existe")).toThrow(
        EstoqueVendaError,
      );
    });

    it("lança EstoqueVendaError para reserva que não está ATIVA", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(3);
      const reservaId = estoque.reservas[0].id;
      estoque.cancelarReserva(reservaId);
      expect(() => estoque.cancelarReserva(reservaId)).toThrow(
        EstoqueVendaError,
      );
    });
  });

  describe("baixarPorVenda", () => {
    it("baixa o saldo físico sem mexer na reserva", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(3, "orc-1", "ORCAMENTO");

      estoque.baixarPorVenda(2, "venda-1", "VENDA", "Venda balcão");

      expect(estoque.quantidadeAtual).toBe(8);
      expect(estoque.quantidadeReservada).toBe(3); // venda direta não mexe na reserva
      expect(estoque.quantidadeDisponivel).toBe(5);
      const mov = estoque.movimentacoes.at(-1);
      expect(mov?.tipo).toBe("BAIXA_VENDA");
      expect(mov?.referenciaId).toBe("venda-1");
    });

    it("lança EstoqueVendaError quando a venda supera o disponível", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(8);
      expect(() => estoque.baixarPorVenda(3)).toThrow(EstoqueVendaError); // sobram 2
    });
  });

  describe("converterReservaEmVenda", () => {
    it("converte reserva ativa em venda", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(3, "orc-1", "ORCAMENTO");
      const reservaId = estoque.reservas[0].id;

      estoque.converterReservaEmVenda(reservaId, "Cliente aceitou");

      expect(estoque.quantidadeAtual).toBe(7);
      expect(estoque.quantidadeReservada).toBe(0);
      expect(estoque.quantidadeDisponivel).toBe(7);
      expect(estoque.reservas[0].status).toBe("CONVERTIDA_EM_VENDA");
      const mov = estoque.movimentacoes.at(-1);
      expect(mov?.tipo).toBe("BAIXA_VENDA");
      expect(mov?.quantidadeReservadaAnterior).toBe(3);
      expect(mov?.quantidadeReservadaNova).toBe(0);
    });

    it("lança EstoqueVendaError para reserva inexistente", () => {
      const estoque = criarEstoque();
      expect(() => estoque.converterReservaEmVenda("nao-existe")).toThrow(
        EstoqueVendaError,
      );
    });

    it("lança EstoqueVendaError para reserva que não está ATIVA", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(3);
      const reservaId = estoque.reservas[0].id;
      estoque.cancelarReserva(reservaId);
      expect(() => estoque.converterReservaEmVenda(reservaId)).toThrow(
        EstoqueVendaError,
      );
    });
  });

  describe("registrarDevolucao", () => {
    it("devolve ao saldo físico", () => {
      const estoque = criarEstoque();
      estoque.baixarPorVenda(2, "venda-1", "VENDA");

      estoque.registrarDevolucao(1, "Cliente devolveu");

      expect(estoque.quantidadeAtual).toBe(9);
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("DEVOLUCAO");
    });
  });

  describe("registrarPerda", () => {
    it("baixa o saldo físico por perda", () => {
      const estoque = criarEstoque();
      estoque.registrarPerda(2, "Embalagem danificada");

      expect(estoque.quantidadeAtual).toBe(8);
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("PERDA");
    });

    it("lança EstoqueVendaError quando a perda supera o disponível", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(9);
      expect(() => estoque.registrarPerda(2)).toThrow(EstoqueVendaError);
    });
  });

  describe("ajustarQuantidade", () => {
    it("ajusta o saldo e registra AJUSTE", () => {
      const estoque = criarEstoque();
      estoque.ajustarQuantidade(12);

      expect(estoque.quantidadeAtual).toBe(12);
      expect(estoque.movimentacoes.at(-1)?.tipo).toBe("AJUSTE");
    });

    it("não registra movimentação quando o saldo não muda", () => {
      const estoque = criarEstoque();
      const antes = estoque.movimentacoes.length;
      estoque.ajustarQuantidade(10);
      expect(estoque.movimentacoes).toHaveLength(antes);
    });

    it("lança EstoqueVendaError para quantidade negativa", () => {
      const estoque = criarEstoque();
      expect(() => estoque.ajustarQuantidade(-1)).toThrow(EstoqueVendaError);
    });

    it("lança EstoqueVendaError quando o ajuste fica abaixo da reserva", () => {
      const estoque = criarEstoque();
      estoque.reservarQuantidade(6);
      expect(() => estoque.ajustarQuantidade(4)).toThrow(EstoqueVendaError);
    });
  });
});
