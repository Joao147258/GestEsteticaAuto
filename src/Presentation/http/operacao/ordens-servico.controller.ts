import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AtualizarOrdemServicoDto,
  CancelarOrdemServicoDto,
  ConcluirOrdemServicoDto,
  ConfirmarConsumoItemOsDto,
  ConsultarConsumoPrevistoQueryDto,
  GerarOrdemServicoDto,
  ListarOrdensServicoQueryDto,
  PausarOrdemServicoDto,
  TransicaoStatusOsDto,
} from './dto';
import { OrdensServicoService } from './ordens-servico.service';
import { ConsumoInsumosItemOsPresenter } from './presenters/consumo-insumos-item-os.presenter';
import { OrdemServicoPresenter } from './presenters/ordem-servico.presenter';

// OrdensServicoController — rotas administrativas para o ciclo de vida completo e consumo de insumos de Ordens de Serviço.
// Mapeado sob /admin/ordens-servico, alinhado ao padrão arquitetural REST multi-tenant do GestCorp Auto.
// Não executa regras de domínio diretamente; todas as operações delegam para os use-cases via OrdensServicoService.
@Controller('admin/ordens-servico')
export class OrdensServicoController {
  constructor(private readonly ordensServicoService: OrdensServicoService) {}

  // POST /admin/ordens-servico
  // Gera uma nova Ordem de Serviço a partir de um orçamento formalmente aprovado (status ACEITO).
  // Garante idempotência: se o orçamento já possui uma OS gerada, retorna a OS existente.
  @Post()
  async gerar(@Body() body: GerarOrdemServicoDto) {
    const os = await this.ordensServicoService.gerar(body.negocioId, body.orcamentoId);
    return OrdemServicoPresenter.toHTTP(os);
  }

  // GET /admin/ordens-servico
  // Lista as Ordens de Serviço do tenant com suporte a filtros combinados (status, cliente, veículo, orçamento, datas).
  // Sempre exige o negocioId para garantir o isolamento estrito de dados entre oficinas.
  @Get()
  async listar(@Query() query: ListarOrdensServicoQueryDto) {
    const ordens = await this.ordensServicoService.listar({
      negocioId: query.negocioId,
      status: query.status as any,
      clienteId: query.clienteId,
      veiculoId: query.veiculoId,
      orcamentoId: query.orcamentoId,
      busca: query.busca,
      pagina: query.pagina,
      limite: query.limite,
      dataInicio: query.dataInicio ? new Date(query.dataInicio) : undefined,
      dataFim: query.dataFim ? new Date(query.dataFim) : undefined,
    });
    return OrdemServicoPresenter.manyToHTTP(ordens);
  }

  // GET /admin/ordens-servico/:id?negocioId=xxx
  // Recupera os detalhes completos de uma Ordem de Serviço (itens, inspeção, alterações históricas).
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
    @Query('negocioId') queryNegocioId: string,
  ) {
    const os = await this.ordensServicoService.buscarPorId(queryNegocioId, id);
    return OrdemServicoPresenter.toHTTP(os);
  }

  // PATCH /admin/ordens-servico/:id
  // Atualiza observações operacionais e previsões estimadas de início e término do serviço.
  // Não altera o status da OS (as transições de status possuem rotas dedicadas e auditadas).
  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() body: AtualizarOrdemServicoDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const os = await this.ordensServicoService.atualizar({
      negocioId,
      ordemServicoId: id,
      observacoes: body.observacoes,
      previsaoInicio: body.previsaoInicio ? new Date(body.previsaoInicio) : undefined,
      previsaoConclusao: body.previsaoConclusao ? new Date(body.previsaoConclusao) : undefined,
    });
    return OrdemServicoPresenter.toHTTP(os);
  }

  // POST /admin/ordens-servico/:id/iniciar
  // Transiciona o status da Ordem de Serviço para EM_EXECUCAO.
  // O domínio exige que a OS esteja em status ABERTA ou AGUARDANDO_VEICULO.
  @Post(':id/iniciar')
  async iniciar(
    @Param('id') id: string,
    @Body() body: TransicaoStatusOsDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const os = await this.ordensServicoService.iniciar(negocioId, id);
    return OrdemServicoPresenter.toHTTP(os);
  }

  // POST /admin/ordens-servico/:id/pausar
  // Pausa a execução dos trabalhos na OS, transicionando para status PAUSADA.
  // Permite opcionalmente registrar o motivo da pausa no payload.
  @Post(':id/pausar')
  async pausar(
    @Param('id') id: string,
    @Body() body: PausarOrdemServicoDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const os = await this.ordensServicoService.pausar(negocioId, id, body?.motivo);
    return OrdemServicoPresenter.toHTTP(os);
  }

  // POST /admin/ordens-servico/:id/concluir
  // Conclui formalmente a execução dos serviços na oficina, transicionando para CONCLUIDA.
  // O domínio valida que todos os itens estejam com execução finalizada.
  @Post(':id/concluir')
  async concluir(
    @Param('id') id: string,
    @Body() body: ConcluirOrdemServicoDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const os = await this.ordensServicoService.concluir(
      negocioId,
      id,
      body?.observacaoConclusao,
    );
    return OrdemServicoPresenter.toHTTP(os);
  }

  // POST /admin/ordens-servico/:id/entregar
  // Transiciona a OS para o status ENTREGUE quando o veículo é devolvido ao cliente.
  // Apenas ordens com status CONCLUIDA podem ser entregues.
  @Post(':id/entregar')
  async entregar(
    @Param('id') id: string,
    @Body() body: TransicaoStatusOsDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const os = await this.ordensServicoService.entregar(negocioId, id);
    return OrdemServicoPresenter.toHTTP(os);
  }

  // POST /admin/ordens-servico/:id/cancelar
  // Cancela a Ordem de Serviço registrando a justificativa obrigatória no histórico auditável.
  @Post(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body() body: CancelarOrdemServicoDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const os = await this.ordensServicoService.cancelar(negocioId, id, body.motivo);
    return OrdemServicoPresenter.toHTTP(os);
  }

  // GET /admin/ordens-servico/:osId/itens/:itemId/consumo-previsto?negocioId=xxx
  // Consulta de insumos previstos calculados com base na ficha técnica do serviço associado ao item da OS.
  // Endpoint de leitura pura: não altera saldos nem gera movimentações de estoque.
  @Get(':osId/itens/:itemId/consumo-previsto')
  async obterConsumoPrevisto(
    @Param('osId') osId: string,
    @Param('itemId') itemId: string,
    @Query() query: ConsultarConsumoPrevistoQueryDto,
  ) {
    const sugestoes = await this.ordensServicoService.calcularConsumoPrevisto(
      query.negocioId,
      osId,
      itemId,
    );
    return ConsumoInsumosItemOsPresenter.sugestaoToHTTP(osId, itemId, sugestoes);
  }

  // POST /admin/ordens-servico/:osId/itens/:itemId/confirmar-consumo
  // Efetiva a baixa de insumos no estoque interno para o item de OS executado.
  // O payload valida o negocioId e aciona as proteções de duplicidade/idempotência e conversão de medidas.
  @Post(':osId/itens/:itemId/confirmar-consumo')
  async confirmarConsumo(
    @Param('osId') osId: string,
    @Param('itemId') itemId: string,
    @Body() body: ConfirmarConsumoItemOsDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const resultado = await this.ordensServicoService.confirmarConsumo(
      negocioId,
      osId,
      itemId,
    );
    return ConsumoInsumosItemOsPresenter.confirmacaoToHTTP(osId, itemId, resultado);
  }
}
