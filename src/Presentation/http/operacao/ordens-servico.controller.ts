import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ConfirmarConsumoItemOsDto } from './dto/confirmar-consumo-item-os.dto';
import { ConsultarConsumoPrevistoQueryDto } from './dto/consultar-consumo-previsto-query.dto';
import { OrdensServicoService } from './ordens-servico.service';
import { ConsumoInsumosItemOsPresenter } from './presenters/consumo-insumos-item-os.presenter';

// OrdensServicoController — rotas administrativas para o ciclo operacional de Ordens de Serviço.
// Mapeado sob /admin/ordens-servico, alinhado ao padrão arquitetural REST multi-tenant do GestCorp Auto.
// Nesta fase, expõe os endpoints de consulta de consumo previsto e confirmação física de baixa de insumos.
@Controller('admin/ordens-servico')
export class OrdensServicoController {
  constructor(private readonly ordensServicoService: OrdensServicoService) {}

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
