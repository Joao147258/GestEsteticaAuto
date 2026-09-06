import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdicionarConsumoInsumoServicoDto } from './dto/adicionar-consumo-insumo-servico.dto';
import { AtualizarServicoDto } from './dto/atualizar-servico.dto';
import { CriarServicoDto } from './dto/criar-servico.dto';
import { ListarServicosQueryDto } from './dto/listar-servicos-query.dto';
import { ConsumoInsumoServicoPresenter, ServicoPresenter } from './presenters/servico.presenter';
import { ServicosService } from './servicos.service';

// ServicosController — rotas administrativas para catálogo de serviços e ficha técnica.
// Segue o padrão arquitetural do projeto (@Controller('admin/...')).
// A Presentation recebe params/query/body, delega ao ServicosService e devolve via Presenter.
@Controller('admin/servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  // POST /admin/servicos — cria um novo serviço no catálogo do negócio.
  @Post()
  async criar(@Body() body: CriarServicoDto) {
    const servico = await this.servicosService.criar(body);
    return ServicoPresenter.toHTTP(servico);
  }

  // GET /admin/servicos?negocioId=xxx&busca=&pagina=&limite=&ativo= — lista serviços com filtros.
  @Get()
  async listar(@Query() query: ListarServicosQueryDto) {
    const servicos = await this.servicosService.listar(query);
    return ServicoPresenter.manyToHTTP(servicos);
  }

  // GET /admin/servicos/:id?negocioId=xxx — busca um serviço pelo ID no escopo do negócio.
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
    @Query('negocioId') negocioId: string,
  ) {
    const servico = await this.servicosService.buscarPorId(negocioId, id);
    return ServicoPresenter.toHTTP(servico);
  }

  // PATCH /admin/servicos/:id — atualiza dados cadastrais de um serviço existente.
  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() body: AtualizarServicoDto,
  ) {
    const servico = await this.servicosService.atualizar(id, body);
    return ServicoPresenter.toHTTP(servico);
  }

  // DELETE /admin/servicos/:id?negocioId=xxx — inativa o serviço (soft delete operacional).
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async inativar(
    @Param('id') id: string,
    @Query('negocioId') negocioId: string,
  ) {
    await this.servicosService.inativar(negocioId, id);
  }

  // POST /admin/servicos/:id/ativar?negocioId=xxx — reativa um serviço inativo.
  @Post(':id/ativar')
  async ativar(
    @Param('id') id: string,
    @Query('negocioId') queryNegocioId?: string,
    @Body('negocioId') bodyNegocioId?: string,
  ) {
    const negocioId = (queryNegocioId || bodyNegocioId || '').trim();
    const servico = await this.servicosService.ativar(negocioId, id);
    return ServicoPresenter.toHTTP(servico);
  }

  // ==========================================
  // ROTAS DA FICHA TÉCNICA DE CONSUMO
  // ==========================================

  // POST /admin/servicos/:id/consumos — adiciona insumo à ficha técnica do serviço.
  @Post(':id/consumos')
  async adicionarConsumo(
    @Param('id') servicoId: string,
    @Body() body: AdicionarConsumoInsumoServicoDto,
  ) {
    const consumo = await this.servicosService.adicionarConsumo(servicoId, body);
    return ConsumoInsumoServicoPresenter.toHTTP(consumo);
  }

  // GET /admin/servicos/:id/consumos?negocioId=xxx — lista insumos da ficha técnica do serviço.
  @Get(':id/consumos')
  async listarConsumos(
    @Param('id') servicoId: string,
    @Query('negocioId') negocioId: string,
  ) {
    const consumos = await this.servicosService.listarConsumos(negocioId, servicoId);
    return ConsumoInsumoServicoPresenter.manyToHTTP(consumos);
  }

  // DELETE /admin/servicos/:id/consumos/:consumoId?negocioId=xxx — remove insumo da ficha técnica.
  @Delete(':id/consumos/:consumoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerConsumo(
    @Param('id') _servicoId: string,
    @Param('consumoId') consumoId: string,
    @Query('negocioId') negocioId: string,
  ) {
    await this.servicosService.removerConsumo(negocioId, consumoId);
  }
}
