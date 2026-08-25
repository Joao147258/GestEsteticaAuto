// Depuração do módulo financeiro (Título e Pagamento).
import { Titulo } from "../../src/Domain/financeiro/titulo";
import { Pagamento } from "../../src/Domain/financeiro/pagamento";
import { mostrar } from "./_utils";

export function executarFinanceiro(): void {
  const titulo = Titulo.criar({
    id: "tit-1",
    negocioId: "neg-123",
    clienteId: "cli-1",
    orcamentoId: "orc-1",
    descricao: "Serviço de polimento",
    valorTotal: 340,
    status: "ABERTO",
    dataEmissao: new Date(),
    dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    parcelas: [
      {
        id: "par-1",
        tituloId: "tit-1",
        numero: 1,
        valor: 340,
        status: "PENDENTE",
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        criadoEm: new Date(),
      },
    ],
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  });

  mostrar("Título criado", {
    id: titulo.id,
    clienteId: titulo.clienteId,
    descricao: titulo.descricao,
    valorTotal: titulo.valorTotal,
    status: titulo.status,
    parcelas: titulo.parcelas,
  });

  const pagamento = Pagamento.criar({
    id: "pag-1",
    tituloId: titulo.id,
    parcelaId: "par-1",
    formaPagamentoId: "fp-1",
    valor: 340,
    status: "REALIZADO",
    dataPagamento: new Date(),
    criadoEm: new Date(),
  });

  mostrar("Pagamento criado", {
    id: pagamento.id,
    tituloId: pagamento.tituloId,
    valor: pagamento.valor,
    status: pagamento.status,
  });
}
