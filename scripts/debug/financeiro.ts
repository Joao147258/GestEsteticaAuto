// Depuração do módulo financeiro (TituloFinanceiro e Pagamento).
import { TituloFinanceiro } from "../../src/Domain/financeiro/titulo_financeiro";
import { mostrar } from "./_utils";

export function executarFinanceiro(): void {
  const titulo = TituloFinanceiro.criar({
    negocioId: "neg-123",
    clienteId: "cli-1",
    origem: "ORCAMENTO",
    origemId: "orc-1",
    descricao: "Serviço de polimento",
    valorOriginal: 340,
    dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    parcelas: [
      {
        numero: 1,
        tipo: "SINAL",
        descricao: "Sinal / Entrada",
        valorOriginal: 100,
        dataVencimento: new Date(),
      },
      {
        numero: 2,
        tipo: "PARCELA",
        descricao: "Restante",
        valorOriginal: 240,
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  mostrar("Título criado", {
    id: titulo.id,
    clienteId: titulo.clienteId,
    descricao: titulo.descricao,
    valorTotal: titulo.valorTotal,
    status: titulo.status,
    parcelas: titulo.parcelas.map((p) => ({
      numero: p.numero,
      tipo: p.tipo,
      valorOriginal: p.valorOriginal,
      status: p.status,
    })),
  });

  const parcelaSinal = titulo.parcelas.find((p) => p.tipo === "SINAL");
  if (!parcelaSinal) {
    mostrar("ERRO", "Parcela SINAL não encontrada");
    return;
  }

  const pagamentoId = titulo.registrarPagamento({
    parcelaFinanceiraId: parcelaSinal.id,
    valor: 100,
    formaPagamentoId: "fp-1",
    formaPagamentoDescricao: "PIX",
  });

  titulo.confirmarPagamento(pagamentoId);

  mostrar("Após pagamento do sinal", {
    pagamentoId,
    statusTitulo: titulo.status,
    saldoAberto: titulo.saldoAberto,
    parcelaSinal: titulo.parcelas.find((p) => p.tipo === "SINAL")?.status,
    historico: titulo.historico.map((h) => ({ tipo: h.tipo, descricao: h.descricao })),
  });
}
