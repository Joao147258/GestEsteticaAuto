import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  CancelarTituloReceberDto,
  GerarTituloReceberDto,
  ListarTitulosReceberQueryDto,
  RegistrarPagamentoDto,
} from './dto';
import { FinanceiroService } from './financeiro.service';
import { TituloFinanceiroPresenter } from './presenters/titulo-financeiro.presenter';

// FinanceiroController — rotas administrativas para gestão de títulos a receber e quitações financeiras.
// Mapeado sob /admin/financeiro, mantendo o padrão arquitetural multi-tenant do GestCorp Auto.
// Conversa com os use-cases através do FinanceiroService, nunca acessando o Prisma ou o Domínio diretamente.
@Controller('admin/financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  // POST /admin/financeiro/titulos
  // Gera um título financeiro a receber a partir de um orçamento aprovado ou lançamento avulso.
  // Garante idempotência: se o orçamento já possui cobrança gerada, retorna a cobrança existente.
  @Post('titulos')
  async gerar(@Body() body: GerarTituloReceberDto) {
    const titulo = await this.financeiroService.gerar(body);
    return TituloFinanceiroPresenter.toHTTP(titulo);
  }

  // GET /admin/financeiro/titulos
  // Lista os títulos a receber com suporte a múltiplos filtros (cliente, status, período de vencimento e busca).
  @Get('titulos')
  async listar(@Query() query: ListarTitulosReceberQueryDto) {
    const titulos = await this.financeiroService.listar(query);
    return TituloFinanceiroPresenter.manyToHTTP(titulos);
  }

  // GET /admin/financeiro/titulos/:id?negocioId=xxx
  // Recupera os dados detalhados de um título a receber, incluindo parcelas, histórico de pagamentos e auditoria.
  @Get('titulos/:id')
  async buscarPorId(
    @Param('id') id: string,
    @Query('negocioId') queryNegocioId: string,
  ) {
    const titulo = await this.financeiroService.buscarPorId(queryNegocioId, id);
    return TituloFinanceiroPresenter.toHTTP(titulo);
  }

  // POST /admin/financeiro/titulos/:id/pagamentos
  // Registra a baixa (parcial ou integral) de uma parcela de um título a receber.
  // Recalcula automaticamente o status do título (ABERTO, PARCIALMENTE_PAGO ou PAGO).
  @Post('titulos/:id/pagamentos')
  async registrarPagamento(
    @Param('id') id: string,
    @Body() body: RegistrarPagamentoDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const titulo = await this.financeiroService.registrarPagamento(
      negocioId,
      id,
      { ...body, negocioId },
    );
    return TituloFinanceiroPresenter.toHTTP(titulo);
  }

  // POST /admin/financeiro/titulos/:id/cancelar
  // Cancela um título financeiro em aberto registrando o motivo obrigatório no histórico de auditoria.
  @Post('titulos/:id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body() body: CancelarTituloReceberDto,
    @Query('negocioId') queryNegocioId?: string,
  ) {
    const negocioId = (body?.negocioId || queryNegocioId || '').trim();
    const titulo = await this.financeiroService.cancelar(
      negocioId,
      id,
      body.motivo,
    );
    return TituloFinanceiroPresenter.toHTTP(titulo);
  }
}
