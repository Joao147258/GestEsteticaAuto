// Depuração do módulo operação (Ordem de Serviço e Agendamento).
import { OrdemServico } from "../../src/Domain/operacao/ordem_servico";
import { Agendamento } from "../../src/Domain/operacao/agendamento";
import { mostrar } from "./_utils";

export function executarOperacao(): void {
  // Agendamento do atendimento
  const agendamento = Agendamento.criar({
    negocioId: "neg-123",
    agendaId: "agenda-1",
    clienteId: "cli-1",
    veiculoId: "vei-1",
    orcamentoId: "orc-1",
    inicio: new Date("2026-09-10T09:00:00"),
    duracaoEstimadaMinutos: 120,
  });

  agendamento.confirmar();

  mostrar("Agendamento criado", {
    id: agendamento.id,
    clienteId: agendamento.clienteId,
    veiculoId: agendamento.veiculoId,
    inicio: agendamento.inicio,
    status: agendamento.status,
  });

  // Ordem de serviço baseada no orçamento aceito
  const ordem = OrdemServico.criar({
    negocioId: "neg-123",
    clienteId: "cli-1",
    veiculoId: "vei-1",
    orcamentoId: "orc-1",
    agendamentoId: agendamento.id,
    responsavelId: "func-1",
    observacoes: "Executar polimento completo",
  });

  const itemLavagem = ordem.adicionarItem({
    servicoId: "serv-1",
    descricao: "Lavagem detalhada",
  });
  ordem.adicionarItem({
    servicoId: "serv-2",
    descricao: "Higienização interna",
  });

  // Registro operacional
  ordem.registrarInspecaoEntrada({
    quilometragem: 82300,
    nivelCombustivel: "1/4",
    avarias: ["risco no para-choque dianteiro"],
    itensPessoais: ["carregador de celular"],
  });

  ordem.adicionarChecklist({
    itens: [
      { descricao: "Pintura conferida", marcado: true },
      { descricao: "Rodas conferidas", marcado: true },
    ],
  });

  ordem.adicionarFoto({
    tipo: "ENTRADA",
    url: "https://storage/foto-entrada.jpg",
  });

  // Execução
  ordem.aguardarVeiculo();
  ordem.iniciar();
  ordem.iniciarItem(itemLavagem);
  ordem.concluirItem(itemLavagem);
  ordem.concluirItem(ordem.itens[1].id);
  // Observação registrada antes de concluir (domínio não aceita registros após encerrar).
  ordem.adicionarObservacaoTecnica({
    tipo: "RECOMENDACAO",
    descricao: "Recomendado vitrificação em até 30 dias",
  });
  ordem.concluir();

  mostrar("Ordem de Serviço", {
    id: ordem.id,
    numero: ordem.numero,
    clienteId: ordem.clienteId,
    veiculoId: ordem.veiculoId,
    status: ordem.status,
    abertaEm: ordem.abertaEm,
    iniciadaEm: ordem.iniciadaEm,
    finalizadaEm: ordem.finalizadaEm,
    itens: ordem.itens.map((i) => ({ descricao: i.descricao, status: i.status })),
    inspecao: ordem.inspecaoEntrada
      ? {
          quilometragem: ordem.inspecaoEntrada.quilometragem,
          avarias: ordem.inspecaoEntrada.avarias,
        }
      : null,
    fotos: ordem.fotos.length,
    observacoesTecnicas: ordem.observacoesTecnicas.length,
    alteracoes: ordem.alteracoes.length,
  });
}
