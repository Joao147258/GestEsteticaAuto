// Depuração do módulo estoque de venda (produtos vendidos ao cliente).
import { EstoqueVenda } from "../../src/Domain/estoque_venda/estoque_venda";
import { mostrar } from "./_utils";

export function executarEstoqueVenda(): void {
  const estoque = EstoqueVenda.criar({
    negocioId: "neg-123",
    produtoId: "prod-2",
    unidadeMedida: "UNIDADE",
    quantidadeInicial: 10,
    custoUnitario: 20,
    precoVenda: 35,
    estoqueMinimo: 2,
  });

  mostrar("Estoque de venda criado", {
    id: estoque.id,
    produtoId: estoque.produtoId,
    quantidadeAtual: estoque.quantidadeAtual,
    quantidadeDisponivel: estoque.quantidadeDisponivel,
    margemUnitariaAproximada: estoque.margemUnitariaAproximada,
  });

  // Reserva para orçamento
  estoque.reservarQuantidade(3, "orc-123", "ORCAMENTO", "Reserva de orçamento");

  mostrar("Após reserva", {
    quantidadeAtual: estoque.quantidadeAtual,
    quantidadeReservada: estoque.quantidadeReservada,
    quantidadeDisponivel: estoque.quantidadeDisponivel,
  });

  // Entrada de reposição
  estoque.adicionarEntrada(5, "Compra de reposição");

  // Venda direta (balcão)
  estoque.baixarPorVenda(2, "venda-1", "VENDA", "Venda balcão");

  // Conversão da reserva em venda
  const reservaId = estoque.reservas[0].id;
  estoque.converterReservaEmVenda(reservaId, "Cliente aceitou orçamento");

  mostrar("Após movimentações", {
    quantidadeAtual: estoque.quantidadeAtual,
    quantidadeReservada: estoque.quantidadeReservada,
    quantidadeDisponivel: estoque.quantidadeDisponivel,
    totalMovimentacoes: estoque.movimentacoes.length,
    totalReservas: estoque.reservas.length,
  });

  mostrar("Reservas", estoque.reservas.map((r) => ({
    id: r.id,
    quantidade: r.quantidade,
    status: r.status,
    referenciaTipo: r.referenciaTipo,
    referenciaId: r.referenciaId,
  })));

  mostrar("Histórico de movimentações", estoque.movimentacoes.map((m) => ({
    tipo: m.tipo,
    quantidade: m.quantidade,
    anterior: m.quantidadeAnterior,
    nova: m.quantidadeNova,
    reservadaAnterior: m.quantidadeReservadaAnterior,
    reservadaNova: m.quantidadeReservadaNova,
    referenciaTipo: m.referenciaTipo,
    referenciaId: m.referenciaId,
  })));
}
