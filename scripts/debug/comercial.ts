// Depuração do módulo comercial (Orçamento, Política e Condição).
import { Orcamento } from "../../src/Domain/comercial/orcamento";
import { PoliticaComercial } from "../../src/Domain/comercial/politica_comercial";
import { CondicaoComercial } from "../../src/Domain/comercial/condicao_comercial";
import { mostrar } from "./_utils";

export function executarComercial(): void {
  // Política padrão: PIX + cartão de crédito (até 3x), desconto máx 10%.
  const politica = PoliticaComercial.criar({
    negocioId: "neg-123",
    nome: "Política padrão",
    descricao: "Regras padrão da estética",
    descontoMaximoPercentual: 10,
    prazoValidadeDias: 7,
    formasPagamento: [
      {
        forma: "PIX",
        ativa: true,
        permiteParcelamento: false,
        quantidadeMaximaParcelas: 1,
        descontoAVistaPercentual: 5,
        repassarTaxaMaquininha: false,
        taxaMaquininhaPercentual: null,
        exigeSinal: true,
        percentualMinimoSinal: 30,
      },
      {
        forma: "CARTAO_CREDITO",
        ativa: true,
        permiteParcelamento: true,
        quantidadeMaximaParcelas: 3,
        descontoAVistaPercentual: null,
        repassarTaxaMaquininha: true,
        taxaMaquininhaPercentual: 3.5,
        exigeSinal: false,
        percentualMinimoSinal: null,
      },
    ],
    jurosAtrasoPercentualMes: 2,
    multaAtrasoPercentual: null,
  });

  mostrar("Política criada", {
    id: politica.id,
    nome: politica.nome,
    descontoMaximoPercentual: politica.descontoMaximoPercentual,
    prazoValidadeDias: politica.prazoValidadeDias,
    formasPagamento: politica.formasPagamento.map((r) => r.forma),
    permitePix: politica.permiteFormaPagamento("PIX"),
  });

  // Condição aplicada: Pix com 5% de desconto e sinal de 30%.
  const condicao = CondicaoComercial.criar({
    negocioId: "neg-123",
    politicaComercialId: politica.id,
    formaPagamento: "PIX",
    quantidadeParcelas: 1,
    tipoDesconto: "PERCENTUAL",
    valorDesconto: 5,
    valorSinal: 150,
    observacao: "Pagamento via Pix com sinal de 30%",
  });

  // Política valida a condição contra o total do orçamento.
  politica.validarCondicao(condicao, 500);

  mostrar("Condição validada pela política", {
    id: condicao.id,
    formaPagamento: condicao.formaPagamento,
    tipoDesconto: condicao.tipoDesconto,
    valorDesconto: condicao.valorDesconto,
    valorSinal: condicao.valorSinal,
  });

  // Orçamento para o cliente.
  const orcamento = Orcamento.criar({
    negocioId: "neg-123",
    clienteId: "cli-1",
    veiculoId: "vei-1",
    politicaComercialId: politica.id,
    condicaoComercialId: condicao.id,
    observacoes: "Orçamento de polimento completo",
  });

  orcamento.adicionarItem({
    tipo: "SERVICO",
    referenciaId: "serv-1",
    descricao: "Lavagem detalhada",
    quantidade: 1,
    valorUnitario: 120,
  });
  orcamento.adicionarItem({
    tipo: "SERVICO",
    referenciaId: "serv-2",
    descricao: "Higienização interna",
    quantidade: 1,
    valorUnitario: 350,
  });
  orcamento.adicionarItem({
    tipo: "PRODUTO",
    referenciaId: "prod-1",
    descricao: "Aromatizante",
    quantidade: 1,
    valorUnitario: 29.9,
  });

  orcamento.aplicarDesconto(49.9);
  orcamento.abrir();
  orcamento.aceitar("WHATSAPP", "Cliente aceitou pelo WhatsApp");

  mostrar("Orçamento finalizado", {
    id: orcamento.id,
    clienteId: orcamento.clienteId,
    veiculoId: orcamento.veiculoId,
    subtotal: orcamento.subtotal,
    valorDesconto: orcamento.valorDesconto,
    valorTotal: orcamento.valorTotal,
    status: orcamento.status,
    aceite: orcamento.aceite?.status,
    canal: orcamento.aceite?.canal,
    itens: orcamento.itens.map((i) => ({
      tipo: i.tipo,
      descricao: i.descricao,
      quantidade: i.quantidade,
      valorTotal: i.valorTotal,
    })),
    alteracoes: orcamento.alteracoes.length,
  });
}
