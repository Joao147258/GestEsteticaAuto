import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AjustarQuantidadeEstoqueInternoDto } from './dto/ajustar-quantidade-estoque-interno.dto';
import { CriarItemEstoqueInternoDto } from './dto/criar-item-estoque-interno.dto';
import { ListarMovimentacoesEstoqueInternoQueryDto } from './dto/listar-movimentacoes-estoque-interno-query.dto';
import { RegistrarEntradaEstoqueInternoDto } from './dto/registrar-entrada-estoque-interno.dto';
import { RegistrarPerdaEstoqueInternoDto } from './dto/registrar-perda-estoque-interno.dto';
import { RegistrarSaidaInternaEstoqueInternoDto } from './dto/registrar-saida-interna-estoque-interno.dto';
import { EstoqueInternoService } from './estoque-interno.service';
import { EstoqueInternoPresenter } from './presenters/estoque-interno.presenter';

// EstoqueInternoController — expõe a camada HTTP administrativa para gestão de estoque interno de insumos.
// Endpoints mapeados sob o prefixo /admin/estoque-interno, garantindo isolamento multi-tenant por negocioId.
// A camada de Presentation apenas valida os contratos (DTOs), delega para o EstoqueInternoService
// e padroniza os retornos JSON através do EstoqueInternoPresenter sem expor métodos internos da entidade de domínio.
@Controller('admin/estoque-interno')
export class EstoqueInternoController {
  constructor(private readonly estoqueInternoService: EstoqueInternoService) {}

  // POST /admin/estoque-interno — inicializa a ficha/saldo de um produto como insumo no negócio.
  // Recebe produtoId, negocioId, quantidadeInicial (ou quantidadeAtual) e metadados opcionais.
  // O negocioId no body garante que o estoque seja isolado na conta do estabelecimento correto.
  @Post()
  async criarItem(@Body() body: CriarItemEstoqueInternoDto) {
    const estoque = await this.estoqueInternoService.criarItem(body);
    return EstoqueInternoPresenter.toHTTP(estoque);
  }

  // GET /admin/estoque-interno/:produtoId/saldo?negocioId=xxx — consulta o saldo consolidado de um insumo.
  // A passagem de negocioId via query string é mandatória para respeitar as regras multi-tenant do GestCorp Auto.
  // Se o insumo não for encontrado para o negócio, o use-case dispara NotFoundException tratada pelo filtro global.
  @Get(':produtoId/saldo')
  async consultarSaldo(
    @Param('produtoId') produtoId: string,
    @Query('negocioId') negocioId: string,
  ) {
    const estoque = await this.estoqueInternoService.consultarSaldo(negocioId, produtoId);
    return EstoqueInternoPresenter.toHTTP(estoque);
  }

  // POST /admin/estoque-interno/:produtoId/entradas — registra entrada de insumo por compra ou reposição.
  // Recebe quantidade positiva e motivo opcional, gerando movimentação de auditoria do tipo ENTRADA.
  // O retorno devolve o saldo atualizado formatado via presenter.
  @Post(':produtoId/entradas')
  async registrarEntrada(
    @Param('produtoId') produtoId: string,
    @Body() body: RegistrarEntradaEstoqueInternoDto,
  ) {
    const estoque = await this.estoqueInternoService.registrarEntrada(produtoId, body);
    return EstoqueInternoPresenter.toHTTP(estoque);
  }

  // POST /admin/estoque-interno/:produtoId/saidas — registra baixa operacional de insumo.
  // Utilizado no consumo interno por ordens de serviço ou aplicação direta na oficina.
  // Impede saldo negativo e registra auditoria com referenciaId/referenciaTipo quando vinculada a OS.
  @Post(':produtoId/saidas')
  async registrarSaidaInterna(
    @Param('produtoId') produtoId: string,
    @Body() body: RegistrarSaidaInternaEstoqueInternoDto,
  ) {
    const estoque = await this.estoqueInternoService.registrarSaidaInterna(produtoId, body);
    return EstoqueInternoPresenter.toHTTP(estoque);
  }

  // POST /admin/estoque-interno/:produtoId/perdas — registra descarte, vencimento ou dano de insumos.
  // Requer motivo obrigatório na validação do DTO para fins de rastreabilidade de custos da operação.
  // Deduz da quantidade atual e armazena histórico do tipo PERDA.
  @Post(':produtoId/perdas')
  async registrarPerda(
    @Param('produtoId') produtoId: string,
    @Body() body: RegistrarPerdaEstoqueInternoDto,
  ) {
    const estoque = await this.estoqueInternoService.registrarPerda(produtoId, body);
    return EstoqueInternoPresenter.toHTTP(estoque);
  }

  // POST /admin/estoque-interno/:produtoId/ajustes — ajuste pontual de contagem física (inventário).
  // Substitui a quantidade atual pelo valor real apurado em balanço e calcula o delta na movimentação.
  // Exige motivo para controle de auditoria fiscal e contábil.
  @Post(':produtoId/ajustes')
  async ajustarQuantidade(
    @Param('produtoId') produtoId: string,
    @Body() body: AjustarQuantidadeEstoqueInternoDto,
  ) {
    const estoque = await this.estoqueInternoService.ajustarQuantidade(produtoId, body);
    return EstoqueInternoPresenter.toHTTP(estoque);
  }

  // GET /admin/estoque-interno/:produtoId/movimentacoes?negocioId=xxx — histórico cronológico de movimentações.
  // Retorna array de movimentações com tipo, quantidade movimentada, saldo anterior e novo, ordenadas por data.
  // Permite auditoria completa de qualquer divergência física ou de apontamento na oficina.
  @Get(':produtoId/movimentacoes')
  async listarMovimentacoes(
    @Param('produtoId') produtoId: string,
    @Query() query: ListarMovimentacoesEstoqueInternoQueryDto,
  ) {
    const movimentacoes = await this.estoqueInternoService.listarMovimentacoes(produtoId, query);
    return EstoqueInternoPresenter.movimentacoesToHTTP(movimentacoes);
  }
}
