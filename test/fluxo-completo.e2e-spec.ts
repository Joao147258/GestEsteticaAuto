import 'dotenv/config';
import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/Presentation/app.module';
import { ApplicationExceptionFilter } from '../src/Presentation/http/filters/application-exception.filter';
import { HttpExceptionFilter } from '../src/Presentation/http/filters/http-exception.filter';
import { validationPipeConfig } from '../src/Presentation/http/pipes/validation-pipe.config';

// Teste E2E de integração em runtime contra PostgreSQL real (tenant gestcorp-auto-demo).
// Cobre as 3 etapas essenciais do sistema:
// 1. Etapa 1: Ciclo de Vida da Ordem de Serviço (Operação)
// 2. Etapa 2: Faturamento e Baixa de Pagamentos (Financeiro)
// 3. Etapa 3: Consolidação e Indicadores Analíticos (Dashboard)
// Além de verificar a idempotência contra duplicidade de dados.
describe('Ciclo Completo de Ponta a Ponta (e2e)', () => {
  let app: INestApplication;
  const tenant = 'gestcorp-auto-demo';

  // Timeout expandido para acomodar comunicação de rede com banco remoto
  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(validationPipeConfig);
    app.useGlobalFilters(
      new ApplicationExceptionFilter(),
      new HttpExceptionFilter(),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('deve executar o fluxo completo de Autenticação -> Orçamento -> OS -> Financeiro -> Dashboard com sucesso', async () => {
    const server = app.getHttpServer();

    // -------------------------------------------------------------
    // 0. AUTENTICAÇÃO V1: Login, Proteção e Obtenção do Token JWT
    // -------------------------------------------------------------
    // 0.1 Tentativa de login com senha incorreta deve retornar 401
    const resLoginInvalido = await request(server)
      .post('/auth/login')
      .send({
        usuario: 'joao.dantas',
        senha: 'SenhaIncorreta@999',
      });
    expect(resLoginInvalido.status).toBe(401);

    // 0.2 Tentativa de acessar /auth/me sem token deve retornar 401
    const resMeSemToken = await request(server).get('/auth/me');
    expect(resMeSemToken.status).toBe(401);

    // 0.2.1 Tentativa de acessar rota administrativa /admin/* sem token deve retornar 401
    const resAdminSemToken = await request(server).get(`/admin/clientes?negocioId=${tenant}`);
    expect(resAdminSemToken.status).toBe(401);

    // 0.2.2 Tentativa de acessar rota administrativa /admin/* com token inválido deve retornar 401
    const resAdminTokenInvalido = await request(server)
      .get(`/admin/clientes?negocioId=${tenant}`)
      .set('Authorization', 'Bearer token.invalido.123');
    expect(resAdminTokenInvalido.status).toBe(401);

    // 0.3 Login com usuário administrador seeded (João Dantas)
    const passJoao = process.env.SEED_PASSWORD_JOAO;
    const passVinicius = process.env.SEED_PASSWORD_VINICIUS;
    if (!passJoao || !passVinicius) {
      throw new Error(
        'Variáveis SEED_PASSWORD_JOAO e SEED_PASSWORD_VINICIUS devem estar configuradas no .env.',
      );
    }

    const resLogin = await request(server)
      .post('/auth/login')
      .send({
        usuario: 'joao.dantas',
        senha: passJoao,
      });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body.accessToken).toBeDefined();
    expect(resLogin.body.usuario.nome).toBe('João Dantas');
    expect(resLogin.body.usuario.username).toBe('joao.dantas');
    expect(resLogin.body.usuario.role).toBe('ADMIN');
    expect(resLogin.body.usuario.papel).toBe('ADMIN');
    expect(resLogin.body.usuario.negocioId).toBe(tenant);
    expect(resLogin.body.usuario.senhaHash).toBeUndefined();

    const token = resLogin.body.accessToken;

    // 0.3.1 Login com segundo administrador seeded (Vinicius Salvador)
    const resLoginVinicius = await request(server)
      .post('/auth/login')
      .send({
        username: 'vinicius.salvador',
        password: passVinicius,
      });
    expect(resLoginVinicius.status).toBe(200);
    expect(resLoginVinicius.body.accessToken).toBeDefined();
    expect(resLoginVinicius.body.usuario.username).toBe('vinicius.salvador');
    expect(resLoginVinicius.body.usuario.role).toBe('ADMIN');
    expect(resLoginVinicius.body.usuario.senhaHash).toBeUndefined();

    // 0.4 Consulta do perfil atual em /auth/me com token Bearer
    const resMe = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(resMe.status).toBe(200);
    expect(resMe.body.nome).toBe('João Dantas');
    expect(resMe.body.username).toBe('joao.dantas');
    expect(resMe.body.role).toBe('ADMIN');
    expect(resMe.body.negocioId).toBe(tenant);

    // -------------------------------------------------------------
    // 1. DADOS BASE: Cliente, Veículo e Serviço de Catálogo
    // -------------------------------------------------------------
    let clienteId: string;
    const resClientes = await request(server)
      .get(`/admin/clientes?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);

    if (resClientes.status === 200 && Array.isArray(resClientes.body) && resClientes.body.length > 0) {
      clienteId = resClientes.body[0].id;
    } else {
      const resNovoCliente = await request(server)
        .post('/admin/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          negocioId: tenant,
          nome: `Cliente E2E ${Date.now()}`,
          tipo: 'PESSOA_FISICA',
          telefone: '11999998888',
        });
      if (resNovoCliente.status !== 201) {
        console.error('ERRO resNovoCliente:', resNovoCliente.body);
      }
      expect(resNovoCliente.status).toBe(201);
      clienteId = resNovoCliente.body.id;
    }
    expect(clienteId).toBeDefined();

    let veiculoId: string;
    const resVeiculos = await request(server)
      .get(`/admin/veiculos?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);

    if (resVeiculos.status === 200 && Array.isArray(resVeiculos.body) && resVeiculos.body.length > 0) {
      veiculoId = resVeiculos.body[0].id;
    } else {
      const resNovoVeiculo = await request(server)
        .post('/admin/veiculos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          negocioId: tenant,
          clienteId,
          marca: 'Honda',
          modelo: 'Civic Touring',
          placa: `E2E${Math.floor(1000 + Math.random() * 9000)}`,
        });
      expect(resNovoVeiculo.status).toBe(201);
      veiculoId = resNovoVeiculo.body.id;
    }
    expect(veiculoId).toBeDefined();

    let servicoId: string;
    const resServicos = await request(server)
      .get(`/admin/servicos?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);

    if (resServicos.status === 200 && Array.isArray(resServicos.body) && resServicos.body.length > 0) {
      servicoId = resServicos.body[0].id;
    } else {
      const resNovoServico = await request(server)
        .post('/admin/servicos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          negocioId: tenant,
          nome: `Polimento Cristalizado E2E ${Date.now()}`,
          precoBase: 350,
        });
      expect(resNovoServico.status).toBe(201);
      servicoId = resNovoServico.body.id;
    }
    expect(servicoId).toBeDefined();

    // -------------------------------------------------------------
    // 2. COMERCIAL: Criar, Abrir e Aceitar Orçamento
    // -------------------------------------------------------------
    const resOrcamento = await request(server)
      .post('/admin/orcamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        clienteId,
        veiculoId,
        observacoes: 'Orçamento de Teste Integrado E2E',
        itens: [
          {
            servicoId,
            quantidade: 1,
            valorUnitario: 450,
          },
        ],
      });
    expect(resOrcamento.status).toBe(201);
    const orcamentoId = resOrcamento.body.id;
    expect(orcamentoId).toBeDefined();

    // Abrir Orçamento (RASCUNHO -> EM_ABERTO)
    const resAbrir = await request(server)
      .post(`/admin/orcamentos/${orcamentoId}/abrir`)
      .set('Authorization', `Bearer ${token}`)
      .send({ negocioId: tenant });
    expect(resAbrir.status).toBe(201);

    // Aprovar Orçamento (EM_ABERTO -> ACEITO)
    const resAceite = await request(server)
      .post(`/admin/orcamentos/${orcamentoId}/aprovar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ negocioId: tenant });
    expect(resAceite.status).toBe(201);
    expect(resAceite.body.status).toBe('ACEITO');

    // -------------------------------------------------------------
    // 3. ETAPA 1: Ciclo de Vida da Ordem de Serviço
    // -------------------------------------------------------------
    // 3.1 Gerar OS a partir do orçamento aprovado
    const resGerarOS = await request(server)
      .post('/admin/ordens-servico')
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        orcamentoId,
      });
    expect(resGerarOS.status).toBe(201);
    const osId = resGerarOS.body.id;
    expect(osId).toBeDefined();
    expect(resGerarOS.body.status).toBe('ABERTA');

    // 3.2 Buscar detalhes da OS gerada
    const resBuscarOS = await request(server)
      .get(`/admin/ordens-servico/${osId}?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resBuscarOS.status).toBe(200);
    expect(resBuscarOS.body.id).toBe(osId);
    expect(resBuscarOS.body.itens.length).toBeGreaterThan(0);

    // 3.3 Atualizar dados da OS (previsões e observações)
    const resAtualizarOS = await request(server)
      .patch(`/admin/ordens-servico/${osId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        observacoes: 'Cuidado redobrado na pintura',
        previsaoInicio: new Date().toISOString(),
        previsaoConclusao: new Date(Date.now() + 86400000).toISOString(),
      });
    expect(resAtualizarOS.status).toBe(200);
    expect(resAtualizarOS.body.observacoes).toBe('Cuidado redobrado na pintura');

    // 3.4 Iniciar execução da OS (ABERTA -> EM_EXECUCAO)
    const resIniciarOS = await request(server)
      .post(`/admin/ordens-servico/${osId}/iniciar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ negocioId: tenant });
    expect(resIniciarOS.status).toBe(201);
    expect(resIniciarOS.body.status).toBe('EM_EXECUCAO');

    // 3.5 Pausar execução da OS (EM_EXECUCAO -> PAUSADA)
    const resPausarOS = await request(server)
      .post(`/admin/ordens-servico/${osId}/pausar`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        motivo: 'Aguardando tempo de secagem do verniz',
      });
    expect(resPausarOS.status).toBe(201);
    expect(resPausarOS.body.status).toBe('PAUSADA');

    // 3.6 Concluir execução da OS (PAUSADA / EM_EXECUCAO -> CONCLUIDA)
    const resConcluirOS = await request(server)
      .post(`/admin/ordens-servico/${osId}/concluir`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        observacaoConclusao: 'Polimento finalizado e inspecionado com sucesso',
      });
    expect(resConcluirOS.status).toBe(201);
    expect(resConcluirOS.body.status).toBe('CONCLUIDA');

    // 3.8 Entregar veículo da OS (CONCLUIDA -> ENTREGUE)
    const resEntregarOS = await request(server)
      .post(`/admin/ordens-servico/${osId}/entregar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ negocioId: tenant });
    expect(resEntregarOS.status).toBe(201);
    expect(resEntregarOS.body.status).toBe('ENTREGUE');

    // -------------------------------------------------------------
    // 4. ETAPA 2: Financeiro (Títulos a Receber e Pagamentos)
    // -------------------------------------------------------------
    // 4.1 Gerar Título a Receber a partir do orçamento concluído
    const resGerarTitulo = await request(server)
      .post('/admin/financeiro/titulos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        orcamentoId,
      });
    expect(resGerarTitulo.status).toBe(201);
    const tituloId = resGerarTitulo.body.id;
    expect(tituloId).toBeDefined();
    expect(resGerarTitulo.body.valorTotal).toBe(450);
    expect(resGerarTitulo.body.saldoDevedor).toBe(450);
    expect(resGerarTitulo.body.status).toBe('ABERTO');
    expect(resGerarTitulo.body.parcelas.length).toBeGreaterThan(0);

    const parcelaId = resGerarTitulo.body.parcelas[0].id;

    // 4.2 Registrar pagamento parcial de R$ 200,00 via PIX
    const resPagto1 = await request(server)
      .post(`/admin/financeiro/titulos/${tituloId}/pagamentos`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        parcelaId,
        valorPago: 200,
        formaPagamento: 'PIX',
        observacoes: 'Entrada via PIX',
      });
    expect(resPagto1.status).toBe(201);
    expect(resPagto1.body.status).toBe('PARCIALMENTE_PAGO');
    expect(resPagto1.body.valorPago).toBe(200);
    expect(resPagto1.body.saldoDevedor).toBe(250);

    // 4.3 Registrar pagamento restante de R$ 250,00 via CARTAO_DEBITO
    const resPagto2 = await request(server)
      .post(`/admin/financeiro/titulos/${tituloId}/pagamentos`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        negocioId: tenant,
        parcelaId,
        valorPago: 250,
        formaPagamento: 'CARTAO_DEBITO',
        observacoes: 'Quitação na entrega',
      });
    expect(resPagto2.status).toBe(201);
    expect(resPagto2.body.status).toBe('PAGO');
    expect(resPagto2.body.valorPago).toBe(450);
    expect(resPagto2.body.saldoDevedor).toBe(0);

    // -------------------------------------------------------------
    // 5. ETAPA 3: Dashboard (Métricas Analíticas e Agregações)
    // -------------------------------------------------------------
    // 5.1 Dashboard Geral
    const resDashGeral = await request(server)
      .get(`/admin/dashboard/geral?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resDashGeral.status).toBe(200);
    expect(resDashGeral.body.comercial).toBeDefined();
    expect(resDashGeral.body.operacional).toBeDefined();
    expect(resDashGeral.body.financeiro).toBeDefined();

    // 5.2 Dashboard Comercial
    const resDashComercial = await request(server)
      .get(`/admin/dashboard/comercial?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resDashComercial.status).toBe(200);
    expect(resDashComercial.body.totalOrcamentos).toBeGreaterThanOrEqual(1);

    // 5.3 Dashboard Operacional
    const resDashOperacional = await request(server)
      .get(`/admin/dashboard/operacional?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resDashOperacional.status).toBe(200);
    expect(resDashOperacional.body.totalOrdens).toBeGreaterThanOrEqual(1);
    expect(resDashOperacional.body.ordensPorStatus.ENTREGUE).toBeGreaterThanOrEqual(1);

    // 5.4 Dashboard Financeiro
    const resDashFinanceiro = await request(server)
      .get(`/admin/dashboard/financeiro?negocioId=${tenant}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resDashFinanceiro.status).toBe(200);
    expect(resDashFinanceiro.body.totalRecebidoMes).toBeGreaterThanOrEqual(450);

    // -------------------------------------------------------------
    // 6. TESTES DE IDEMPOTÊNCIA
    // -------------------------------------------------------------
    // Idempotência na geração de OS (re-chamada com mesmo orcamentoId retorna a mesma OS)
    const resOSDuplicada = await request(server)
      .post('/admin/ordens-servico')
      .set('Authorization', `Bearer ${token}`)
      .send({ negocioId: tenant, orcamentoId });
    expect(resOSDuplicada.status).toBe(201);
    expect(resOSDuplicada.body.id).toBe(osId);

    // Idempotência na geração de Título (re-chamada com mesmo orcamentoId retorna o mesmo Título)
    const resTituloDuplicado = await request(server)
      .post('/admin/financeiro/titulos')
      .set('Authorization', `Bearer ${token}`)
      .send({ negocioId: tenant, orcamentoId });
    expect(resTituloDuplicado.status).toBe(201);
    expect(resTituloDuplicado.body.id).toBe(tituloId);

    // -------------------------------------------------------------
    // 7. ENCERRAMENTO DE SESSÃO: POST /auth/logout
    // -------------------------------------------------------------
    const resLogout = await request(server).post('/auth/logout');
    expect(resLogout.status).toBe(200);
    expect(resLogout.body.message).toBe('Sessão encerrada com sucesso.');
  });
});
