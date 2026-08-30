import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AbrirOrcamentoUseCase,
  AdicionarItemOrcamentoUseCase,
  AprovarOrcamentoUseCase,
  AtualizarObservacoesOrcamentoUseCase,
  BuscarOrcamentoPorIdUseCase,
  CancelarOrcamentoUseCase,
  CriarOrcamentoUseCase,
  ListarOrcamentosUseCase,
  OrcamentoOutputDTO,
  RecusarOrcamentoUseCase,
  RemoverItemOrcamentoUseCase,
} from '../../../Application/comercial';
import { AbrirOrcamentoDto } from './dto/abrir-orcamento.dto';
import { AdicionarItemOrcamentoDto } from './dto/adicionar-item-orcamento.dto';
import { AprovarOrcamentoDto } from './dto/aprovar-orcamento.dto';
import { AtualizarObservacoesOrcamentoDto } from './dto/atualizar-observacoes-orcamento.dto';
import { CancelarOrcamentoDto } from './dto/cancelar-orcamento.dto';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { ListarOrcamentosQueryDto } from './dto/listar-orcamentos-query.dto';
import { RecusarOrcamentoDto } from './dto/recusar-orcamento.dto';
import { RemoverItemOrcamentoDto } from './dto/remover-item-orcamento.dto';
import { OrcamentoPresenter } from './presenters/orcamento.presenter';

// OrcamentosController — rotas administrativas de orçamento (painel).
// A Presentation apenas recebe params/query/body, monta o input do use case
// (definindo origem = PAINEL na criação) e devolve o resultado via presenter.
// Nenhuma regra de negócio fica aqui: validação de referências, cálculo de
// valores e mudança de status são dos use cases / domínio. Não acessa Prisma.
//
// negocioId: regra temporária sem autenticação — rotas de consulta recebem
// no query string; rotas de ação recebem no body. Quando a auth existir, o
// negocioId passará a vir do usuário autenticado e estes campos serão
// removidos do contrato HTTP.
@Controller('admin/orcamentos')
export class OrcamentosController {
  constructor(
    private readonly criarOrcamentoUseCase: CriarOrcamentoUseCase,
    private readonly listarOrcamentosUseCase: ListarOrcamentosUseCase,
    private readonly buscarOrcamentoPorIdUseCase: BuscarOrcamentoPorIdUseCase,
    private readonly abrirOrcamentoUseCase: AbrirOrcamentoUseCase,
    private readonly adicionarItemOrcamentoUseCase: AdicionarItemOrcamentoUseCase,
    private readonly removerItemOrcamentoUseCase: RemoverItemOrcamentoUseCase,
    private readonly atualizarObservacoesOrcamentoUseCase: AtualizarObservacoesOrcamentoUseCase,
    private readonly aprovarOrcamentoUseCase: AprovarOrcamentoUseCase,
    private readonly recusarOrcamentoUseCase: RecusarOrcamentoUseCase,
    private readonly cancelarOrcamentoUseCase: CancelarOrcamentoUseCase,
  ) {}

  // POST /admin/orcamentos — cria um orçamento manual pelo painel.
  // A origem é SEMPRE PAINEL: o DTO não expõe o campo e o ValidationPipe
  // (whitelist + forbidNonWhitelisted) rejeita origem: SITE vinda no body.
  @Post()
  async criar(@Body() dto: CriarOrcamentoDto): Promise<OrcamentoOutputDTO> {
    const resultado = await this.criarOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      clienteId: dto.clienteId,
      veiculoId: dto.veiculoId,
      observacoes: dto.observacoes,
      itens: dto.itens.map((item) => ({
        servicoId: item.servicoId,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        observacao: item.observacao,
      })),
      origem: 'PAINEL',
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // GET /admin/orcamentos?negocioId=xxx — lista orçamentos do negócio com
  // filtros suportados pela Application (status, busca, pagina, limite).
  @Get()
  async listar(
    @Query() query: ListarOrcamentosQueryDto,
  ): Promise<OrcamentoOutputDTO[]> {
    const resultado = await this.listarOrcamentosUseCase.executar({
      negocioId: query.negocioId,
      status: query.status,
      busca: query.busca,
      pagina: query.pagina,
      limite: query.limite,
    });
    return OrcamentoPresenter.paraListaHttp(resultado);
  }

  // GET /admin/orcamentos/:id?negocioId=xxx — busca um orçamento no escopo
  // do negócio. Erro de "não encontrado" vira 404 na camada de filtros.
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
    @Query('negocioId') negocioId: string,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.buscarOrcamentoPorIdUseCase.executar({
      negocioId,
      orcamentoId: id,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // POST /admin/orcamentos/:id/abrir — RASCUNHO → EM_ABERTO (prepara para o
  // aceite do cliente). Só o domínio valida se o status permite abrir.
  @Post(':id/abrir')
  async abrir(
    @Param('id') id: string,
    @Body() dto: AbrirOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.abrirOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // POST /admin/orcamentos/:id/itens — adiciona um serviço do catálogo ao
  // orçamento. Validação de serviço e recálculo de total são do use case.
  @Post(':id/itens')
  async adicionarItem(
    @Param('id') id: string,
    @Body() dto: AdicionarItemOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.adicionarItemOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
      servicoId: dto.servicoId,
      quantidade: dto.quantidade,
      valorUnitario: dto.valorUnitario,
      observacao: dto.observacao,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // DELETE /admin/orcamentos/:id/itens/:itemId — remove a linha exata do
  // orçamento (itemId, não servicoId). negocioId no body (regra temporária).
  @Delete(':id/itens/:itemId')
  async removerItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: RemoverItemOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.removerItemOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
      itemId,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // PATCH /admin/orcamentos/:id/observacoes — altera apenas as observações
  // comerciais. Não mexe em itens, status ou valores.
  @Patch(':id/observacoes')
  async atualizarObservacoes(
    @Param('id') id: string,
    @Body() dto: AtualizarObservacoesOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.atualizarObservacoesOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
      observacoes: dto.observacoes,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // POST /admin/orcamentos/:id/aprovar — registra o aceite do cliente
  // (EM_ABERTO → ACEITO). Regra de "pode aprovar" é do domínio.
  @Post(':id/aprovar')
  async aprovar(
    @Param('id') id: string,
    @Body() dto: AprovarOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.aprovarOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // POST /admin/orcamentos/:id/recusar — registra que o cliente recusou.
  // motivo opcional vai para o histórico do aceite.
  @Post(':id/recusar')
  async recusar(
    @Param('id') id: string,
    @Body() dto: RecusarOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.recusarOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
      motivo: dto.motivo,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }

  // POST /admin/orcamentos/:id/cancelar — invalida o orçamento por decisão
  // interna da empresa (não é recusa do cliente). motivo opcional.
  @Post(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body() dto: CancelarOrcamentoDto,
  ): Promise<OrcamentoOutputDTO> {
    const resultado = await this.cancelarOrcamentoUseCase.executar({
      negocioId: dto.negocioId,
      orcamentoId: id,
      motivo: dto.motivo,
    });
    return OrcamentoPresenter.paraHttp(resultado);
  }
}
