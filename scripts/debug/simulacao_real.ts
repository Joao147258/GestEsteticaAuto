// Simulação integrada de um fluxo real na estética automotiva.
//
// Objetivo: demonstrar, de forma didática, como os módulos do domínio se
// conectam por IDs (sem banco, sem Prisma, sem NestJS).
//
// Regra: usamos apenas o que o domínio atual oferece. Módulos em estrutura
// (financeiro, shared) são demonstrados como intenção e marcados no console
// como pendentes — sem inventar regras para a simulação funcionar.
//
// Executar: npm run dbg -- simulacao
import { randomUUID } from "crypto";
import { Negocio } from "../../src/Domain/negocio/negocio";
import { Usuario } from "../../src/Domain/negocio/usuario";
import { Cliente } from "../../src/Domain/clientes/cliente";
import { Veiculo } from "../../src/Domain/veiculos/veiculo";
import { CategoriaProduto } from "../../src/Domain/catalogo/categoria_produto";
import { CategoriaServico } from "../../src/Domain/catalogo/categoria_servico";
import { Produto } from "../../src/Domain/catalogo/produto";
import { Servico } from "../../src/Domain/catalogo/servico";
import { EstoqueInterno } from "../../src/Domain/estoque_interno/estoque_interno";
import { EstoqueVenda } from "../../src/Domain/estoque_venda/estoque_venda";
import { PoliticaComercial } from "../../src/Domain/comercial/politica_comercial";
import { CondicaoComercial } from "../../src/Domain/comercial/condicao_comercial";
import { Orcamento } from "../../src/Domain/comercial/orcamento";
import { Titulo } from "../../src/Domain/financeiro/titulo";
import { Sinal } from "../../src/Domain/financeiro/sinal";
import { Agenda } from "../../src/Domain/operacao/agenda";
import { Agendamento } from "../../src/Domain/operacao/agendamento";
import { OrdemServico } from "../../src/Domain/operacao/ordem_servico";
import { Anexo } from "../../src/Domain/shared/anexo";
import { Auditoria } from "../../src/Domain/shared/auditoria";
import { mostrar } from "./_utils";

// Cabeçalho de seção didático (padrão visual da simulação).
function secao(titulo: string): void {
  const linha = "=".repeat(40);
  console.log(`\n${linha}`);
  console.log(titulo);
  console.log(linha);
}

export function executarSimulacaoReal(): void {
  console.log("\nSIMULAÇÃO INTEGRADA — Estética Auto Prime");
  console.log(
    "Fluxo real de uma estética automotiva conectando os módulos por IDs.\n",
  );

  // ==============================
  // 1. NEGÓCIO E USUÁRIO
  // ==============================
  secao("1. NEGÓCIO E USUÁRIO");

  const negocio = Negocio.criar({
    nome: "Estética Auto Prime",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 4002-8922",
    email: "contato@esteticaautoprime.com.br",
  });
  const usuario = Usuario.criar({
    negocioId: negocio.id,
    nome: "João Vitor (gerente)",
    email: "joao@esteticaautoprime.com.br",
  });

  mostrar("Negócio (tenant — escopa todos os demais módulos)", {
    id: negocio.id,
    nome: negocio.nome,
  });
  mostrar("Usuário (pertence ao negócio via negocioId)", {
    id: usuario.id,
    negocioId: usuario.negocioId,
    nome: usuario.nome,
  });

  // ==============================
  // 2. CLIENTE E VEÍCULO
  // ==============================
  secao("2. CLIENTE E VEÍCULO");

  const cliente = Cliente.criar({
    negocioId: negocio.id,
    nome: "João Silva",
    tipo: "PESSOA_FISICA",
    documento: "123.456.789-00",
    telefone: "(11) 98888-7777",
    email: "joao.silva@email.com",
  });
  const veiculo = Veiculo.criar({
    negocioId: negocio.id,
    clienteId: cliente.id,
    placa: "HND-2020",
    marca: "Honda",
    modelo: "Civic 2020",
    anoFabricacao: 2019,
    anoModelo: 2020,
    cor: "Prata",
    quilometragem: 48000,
  });

  mostrar("Cliente", {
    id: cliente.id,
    nome: cliente.nome,
    telefone: cliente.telefone,
  });
  mostrar("Veículo (vinculado ao cliente por clienteId)", {
    id: veiculo.id,
    clienteId: veiculo.clienteId,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    placa: veiculo.placa,
  });

  // ==============================
  // 3. CATÁLOGO
  // ==============================
  secao("3. CATÁLOGO — categorias, serviços e produtos");

  const categoriaServico = CategoriaServico.criar({
    negocioId: negocio.id,
    nome: "Lavagem e Higienização",
  });
  const categoriaProduto = CategoriaProduto.criar({
    negocioId: negocio.id,
    nome: "Insumos e Aromatizantes",
  });

  const lavagem = Servico.criar({
    negocioId: negocio.id,
    nome: "Lavagem detalhada",
    precoBase: 120,
    duracaoEstimadaMinutos: 60,
  });
  const higienizacao = Servico.criar({
    negocioId: negocio.id,
    nome: "Higienização interna",
    precoBase: 350,
    duracaoEstimadaMinutos: 150,
  });

  const shampoo = Produto.criar({
    negocioId: negocio.id,
    nome: "Shampoo automotivo",
    descricao: "Insumo usado internamente na lavagem",
    tipoUso: "INSUMO_INTERNO",
    unidadeMedida: "UNIDADE",
    custoReferencia: 25,
    precoVendaSugerido: null,
  });
  const aromatizante = Produto.criar({
    negocioId: negocio.id,
    nome: "Aromatizante premium",
    descricao: "Produto vendido ao cliente",
    tipoUso: "PRODUTO_VENDA",
    unidadeMedida: "UNIDADE",
    custoReferencia: 18,
    precoVendaSugerido: 59.9,
  });

  mostrar("Categorias (organização do catálogo)", {
    categoriaServico: categoriaServico.id,
    categoriaProduto: categoriaProduto.id,
  });
  mostrar("Serviços (executáveis pela operação)", {
    lavagem: { id: lavagem.id, precoBase: lavagem.precoBase },
    higienizacao: { id: higienizacao.id, precoBase: higienizacao.precoBase },
  });
  mostrar("Produtos (insumo interno + venda)", {
    shampoo: { id: shampoo.id, tipoUso: shampoo.tipoUso },
    aromatizante: { id: aromatizante.id, tipoUso: aromatizante.tipoUso },
  });

  // ==============================
  // 4. ESTOQUE (INTERNO E DE VENDA)
  // ==============================
  secao("4. ESTOQUE — interno (insumo) e de venda (produto)");

  const estoqueShampoo = EstoqueInterno.criar({
    negocioId: negocio.id,
    produtoId: shampoo.id,
    unidadeMedida: "UNIDADE",
    quantidadeInicial: 20,
    custoUnitarioAproximado: 25,
    estoqueMinimo: 5,
  });
  const estoqueAromatizante = EstoqueVenda.criar({
    negocioId: negocio.id,
    produtoId: aromatizante.id,
    unidadeMedida: "UNIDADE",
    quantidadeInicial: 10,
    custoUnitario: 18,
    precoVenda: 59.9,
    estoqueMinimo: 2,
  });

  mostrar("Estoque interno (referencia produtoId do catálogo)", {
    id: estoqueShampoo.id,
    produtoId: estoqueShampoo.produtoId,
    quantidadeAtual: estoqueShampoo.quantidadeAtual,
  });
  mostrar("Estoque de venda (disponível = atual − reservado)", {
    id: estoqueAromatizante.id,
    produtoId: estoqueAromatizante.produtoId,
    quantidadeAtual: estoqueAromatizante.quantidadeAtual,
    quantidadeDisponivel: estoqueAromatizante.quantidadeDisponivel,
  });

  // ==============================
  // 5. COMERCIAL — política, condição e orçamento
  // ==============================
  secao("5. COMERCIAL — política, condição e orçamento");

  const politica = PoliticaComercial.criar({
    negocioId: negocio.id,
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

  // Condição: PIX com sinal de 30% (a política valida contra o total).
  const condicao = CondicaoComercial.criar({
    negocioId: negocio.id,
    politicaComercialId: politica.id,
    formaPagamento: "PIX",
    quantidadeParcelas: 1,
    tipoDesconto: "PERCENTUAL",
    valorDesconto: 5,
    valorSinal: 158.97,
    observacao: "Pagamento via Pix com sinal de 30%",
  });

  const orcamento = Orcamento.criar({
    negocioId: negocio.id,
    clienteId: cliente.id,
    veiculoId: veiculo.id,
    politicaComercialId: politica.id,
    condicaoComercialId: condicao.id,
    observacoes: "Lavagem detalhada + higienização + aromatizante",
  });

  orcamento.adicionarItem({
    tipo: "SERVICO",
    referenciaId: lavagem.id,
    descricao: "Lavagem detalhada",
    quantidade: 1,
    valorUnitario: 120,
  });
  orcamento.adicionarItem({
    tipo: "SERVICO",
    referenciaId: higienizacao.id,
    descricao: "Higienização interna",
    quantidade: 1,
    valorUnitario: 350,
  });
  orcamento.adicionarItem({
    tipo: "PRODUTO",
    referenciaId: aromatizante.id,
    descricao: "Aromatizante premium",
    quantidade: 1,
    valorUnitario: 59.9,
  });

  // A política valida a condição comercial contra o total calculado.
  politica.validarCondicao(condicao, orcamento.valorTotal);
  orcamento.abrir();
  orcamento.aceitar("WHATSAPP", "Cliente aceitou pelo WhatsApp");

  mostrar("Política (limita o que a condição pode aplicar)", {
    id: politica.id,
    formasPagamento: politica.formasPagamento.map((r) => r.forma),
    permitePix: politica.permiteFormaPagamento("PIX"),
  });
  mostrar("Condição (escolhas da negociação) validada pela política", {
    id: condicao.id,
    formaPagamento: condicao.formaPagamento,
    valorSinal: condicao.valorSinal,
  });
  mostrar("Orçamento (valores calculados pelo domínio)", {
    id: orcamento.id,
    clienteId: orcamento.clienteId,
    veiculoId: orcamento.veiculoId,
    subtotal: orcamento.subtotal,
    valorTotal: orcamento.valorTotal,
    status: orcamento.status,
    aceite: orcamento.aceite?.status,
    canal: orcamento.aceite?.canal,
    itens: orcamento.itens.map((i) => ({
      tipo: i.tipo,
      referenciaId: i.referenciaId,
      descricao: i.descricao,
      valorTotal: i.valorTotal,
    })),
  });

  // ==============================
  // 6. ESTOQUE DE VENDA — reserva do produto
  // ==============================
  secao("6. ESTOQUE DE VENDA — reserva para o orçamento");

  estoqueAromatizante.reservarQuantidade(
    1,
    orcamento.id,
    "ORCAMENTO",
    "Reserva do aromatizante do orçamento",
  );

  mostrar("Após reserva (reserva NÃO baixa a quantidade atual)", {
    quantidadeAtual: estoqueAromatizante.quantidadeAtual,
    quantidadeReservada: estoqueAromatizante.quantidadeReservada,
    quantidadeDisponivel: estoqueAromatizante.quantidadeDisponivel,
  });

  // ==============================
  // 7. FINANCEIRO — estrutura (etapa documentada, sem regras reais)
  // ==============================
  secao("7. FINANCEIRO — título e sinal (estrutura/stub)");

  console.log(
    "Financeiro ainda está em estrutura (stub): Titulo.criar e Sinal.criar\n" +
      "são envoltórios sem validação — etapa demonstrada como intenção, sem regras reais.",
  );

  const titulo = Titulo.criar({
    id: randomUUID(),
    negocioId: negocio.id,
    clienteId: cliente.id,
    orcamentoId: orcamento.id,
    descricao: "Lavagem detalhada + higienização + aromatizante",
    valorTotal: orcamento.valorTotal,
    status: "ABERTO",
    dataEmissao: new Date(),
    dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    parcelas: [
      {
        id: randomUUID(),
        tituloId: "titulo-pendente",
        numero: 1,
        valor: orcamento.valorTotal,
        status: "PENDENTE",
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        criadoEm: new Date(),
      },
    ],
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  });

  const sinal = Sinal.criar({
    id: randomUUID(),
    negocioId: negocio.id,
    clienteId: cliente.id,
    valor: condicao.valorSinal ?? 0,
    status: "RECEBIDO",
    observacoes: "Sinal de 30% via Pix",
    criadoEm: new Date(),
  });

  mostrar("Título (intenção: nasce do orçamento aceito via orcamentoId)", {
    id: titulo.id,
    orcamentoId: titulo.orcamentoId,
    clienteId: titulo.clienteId,
    valorTotal: titulo.valorTotal,
    status: titulo.status,
  });
  mostrar("Sinal (30% do orçamento, conforme a condição)", {
    id: sinal.id,
    clienteId: sinal.clienteId,
    valor: sinal.valor,
    status: sinal.status,
  });

  // ==============================
  // 8. OPERAÇÃO — agenda, agendamento e ordem de serviço
  // ==============================
  secao("8. OPERAÇÃO — agenda, agendamento e ordem de serviço");

  const agenda = Agenda.criar({
    negocioId: negocio.id,
    nome: "Agenda principal",
  });

  const agendamento = Agendamento.criar({
    negocioId: negocio.id,
    agendaId: agenda.id,
    clienteId: cliente.id,
    veiculoId: veiculo.id,
    orcamentoId: orcamento.id,
    inicio: new Date("2026-09-10T09:00:00"),
    duracaoEstimadaMinutos: 210,
  });
  agendamento.confirmar();

  const ordem = OrdemServico.criar({
    negocioId: negocio.id,
    clienteId: cliente.id,
    veiculoId: veiculo.id,
    orcamentoId: orcamento.id,
    agendamentoId: agendamento.id,
    responsavelId: usuario.id,
    observacoes: "Executar lavagem detalhada + higienização",
  });

  const itemLavagem = ordem.adicionarItem({
    servicoId: lavagem.id,
    descricao: "Lavagem detalhada",
  });
  const itemHigienizacao = ordem.adicionarItem({
    servicoId: higienizacao.id,
    descricao: "Higienização interna",
  });

  ordem.registrarInspecaoEntrada({
    quilometragem: 48000,
    nivelCombustivel: "1/2",
    avarias: ["risco leve no para-choque dianteiro"],
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
    url: "https://storage.local/foto-entrada-civic.jpg",
  });

  // Execução da ordem de serviço
  ordem.aguardarVeiculo();
  ordem.iniciar();
  ordem.iniciarItem(itemLavagem);
  ordem.concluirItem(itemLavagem);
  ordem.iniciarItem(itemHigienizacao);
  ordem.concluirItem(itemHigienizacao);
  // Observação técnica registrada durante a execução — a regra do domínio
  // não permite novos registros depois de encerrar a ordem (concluir/cancelar).
  ordem.adicionarObservacaoTecnica({
    tipo: "RECOMENDACAO",
    descricao: "Recomendado vitrificação em até 30 dias",
  });
  ordem.concluir();

  mostrar("Agendamento (conecta agendaId, clienteId, veiculoId, orcamentoId)", {
    id: agendamento.id,
    agendaId: agendamento.agendaId,
    inicio: agendamento.inicio,
    status: agendamento.status,
  });
  mostrar("Ordem de serviço (execução — usa orcamentoId como origem)", {
    id: ordem.id,
    numero: ordem.numero,
    orcamentoId: ordem.orcamentoId,
    clienteId: ordem.clienteId,
    veiculoId: ordem.veiculoId,
    status: ordem.status,
    iniciadaEm: ordem.iniciadaEm,
    finalizadaEm: ordem.finalizadaEm,
    itens: ordem.itens.map((i) => ({
      descricao: i.descricao,
      status: i.status,
    })),
    inspecao: ordem.inspecaoEntrada
      ? {
          quilometragem: ordem.inspecaoEntrada.quilometragem,
          avarias: ordem.inspecaoEntrada.avarias,
        }
      : null,
    checklist: ordem.checklist?.itens.length ?? 0,
    fotos: ordem.fotos.length,
    observacoesTecnicas: ordem.observacoesTecnicas.length,
  });

  // ==============================
  // 9. ESTOQUE — baixa de insumo e conversão da reserva
  // ==============================
  secao("9. ESTOQUE — consumo interno e conversão de reserva em venda");

  // Insumo usado na lavagem (estoque interno).
  estoqueShampoo.registrarSaidaInterna(1, "Lavagem detalhada — Civic 2020");

  // Reserva do aromatizante vira venda (estoque de venda).
  const reservaId = estoqueAromatizante.reservas[
    estoqueAromatizante.reservas.length - 1
  ].id;
  estoqueAromatizante.converterReservaEmVenda(
    reservaId,
    "Orçamento aceito pelo cliente",
  );

  mostrar("Estoque interno após consumo (baixa de insumo)", {
    id: estoqueShampoo.id,
    quantidadeAtual: estoqueShampoo.quantidadeAtual,
    totalMovimentacoes: estoqueShampoo.movimentacoes.length,
  });
  mostrar("Estoque de venda após conversão da reserva em venda", {
    id: estoqueAromatizante.id,
    quantidadeAtual: estoqueAromatizante.quantidadeAtual,
    quantidadeReservada: estoqueAromatizante.quantidadeReservada,
    quantidadeDisponivel: estoqueAromatizante.quantidadeDisponivel,
    reservas: estoqueAromatizante.reservas.map((r) => ({
      quantidade: r.quantidade,
      status: r.status,
    })),
  });

  // ==============================
  // 10. SHARED — anexo e auditoria (estrutura básica)
  // ==============================
  secao("10. SHARED — anexo e auditoria (estrutura básica)");

  console.log(
    "Shared é estrutura básica (sem regras): Anexo e Auditoria registram\n" +
      "referências/trilha sem validação de negócio nesta etapa.",
  );

  const anexo = Anexo.criar({
    id: randomUUID(),
    negocioId: negocio.id,
    nome: "foto-entrada-civic.jpg",
    tipo: "FOTO",
    mimeType: "image/jpeg",
    url: "https://storage.local/foto-entrada-civic.jpg",
    tamanho: 204800,
    criadoEm: new Date(),
  });
  const auditoria = Auditoria.criar({
    id: randomUUID(),
    negocioId: negocio.id,
    entidade: "Orcamento",
    entidadeId: orcamento.id,
    acao: "ACEITAR",
    usuarioId: usuario.id,
    dados: { canal: "WHATSAPP" },
    criadoEm: new Date(),
  });

  mostrar("Anexo (referência de arquivo, sem upload real)", {
    id: anexo.id,
    nome: anexo.nome,
    url: anexo.url,
  });
  mostrar("Auditoria (trilha genérica por entidade)", {
    id: auditoria.id,
    entidade: auditoria.entidade,
    acao: auditoria.acao,
    dados: auditoria.dados,
  });

  // ==============================
  // RESUMO FINAL
  // ==============================
  secao("RESUMO FINAL — como os módulos se conectam por IDs");

  mostrar("IDs criados no fluxo", {
    negocioId: negocio.id,
    usuarioId: usuario.id,
    clienteId: cliente.id,
    veiculoId: veiculo.id,
    orcamentoId: orcamento.id,
    agendamentoId: agendamento.id,
    ordemServicoId: ordem.id,
    tituloId: titulo.id,
    sinalId: sinal.id,
  });
  mostrar("Conexões por ID", {
    "cliente → veiculo": `veiculo.clienteId = ${veiculo.clienteId}`,
    "cliente/veiculo → orcamento": `orcamento.clienteId=${orcamento.clienteId}, veiculoId=${orcamento.veiculoId}`,
    "orcamento → agendamento/OS": `agendamento.orcamentoId=${agendamento.orcamentoId}, ordem.orcamentoId=${ordem.orcamentoId}`,
    "estoque interno → produto": `estoqueShampoo.produtoId=${estoqueShampoo.produtoId}`,
    "estoque venda → produto": `estoqueAromatizante.produtoId=${estoqueAromatizante.produtoId}`,
    "reserva → orcamento": `reserva.referenciaId=${orcamento.id}, referenciaTipo=ORCAMENTO`,
    "financeiro → orcamento": `titulo.orcamentoId=${titulo.orcamentoId}`,
  });
  mostrar("Resultado comercial", {
    orcamentoTotal: orcamento.valorTotal,
    orcamentoStatus: orcamento.status,
    aceiteCanal: orcamento.aceite?.canal,
    sinalRecebido: sinal.valor,
    ordemStatus: ordem.status,
    aromatizanteDisponivel: estoqueAromatizante.quantidadeDisponivel,
  });

  console.log("\nFim da simulação integrada. Todos os módulos conectados por IDs.");
}
