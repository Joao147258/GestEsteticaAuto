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
import { NotFoundError } from '../../../Shared/errors/not-found.error';
import { ClientesService } from './clientes.service';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';
import { CriarClienteDto } from './dto/criar-cliente.dto';
import { ListarClientesQueryDto } from './dto/listar-clientes-query.dto';
import { ClientePresenter } from './presenters/cliente.presenter';

// ClientesController — rotas administrativas de clientes (painel).
// A Presentation apenas recebe params/query/body, delega ao ClientesService
// (que orquestra os use cases da Application) e devolve a resposta via
// presenter. Nenhuma regra de negócio fica aqui: criação, validação e
// mudança de cadastro são dos use cases / domínio. Não acessa Prisma.
//
// negocioId: regra temporária sem autenticação — rotas de consulta recebem
// no query string; rotas de ação (criar/atualizar) recebem no body. Quando
// a auth existir, o negocioId passará a vir do usuário autenticado.
//
// "Cliente não encontrado": o BuscarClientePorIdUseCase devolve null (não
// lança); o controller traduz essa ausência para 404 usando o NotFoundError
// do Shared — o filtro global já o mapeia para o formato padronizado.
@Controller('admin/clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // POST /admin/clientes — cria um cliente manualmente pelo painel.
  @Post()
  async criar(@Body() body: CriarClienteDto) {
    const cliente = await this.clientesService.criar(body);

    return ClientePresenter.toHTTP(cliente);
  }

  // GET /admin/clientes?negocioId=xxx&busca=&pagina=&limite= — lista os
  // clientes do negócio com os filtros suportados pela Application.
  @Get()
  async listar(@Query() query: ListarClientesQueryDto) {
    const clientes = await this.clientesService.listar(query);

    return ClientePresenter.manyToHTTP(clientes);
  }

  // GET /admin/clientes/:id?negocioId=xxx — busca um cliente no escopo do
  // negócio. Ausência vira 404 (NotFoundError) na camada de filtros.
  @Get(':id')
  async buscarPorId(
    @Param('id') clienteId: string,
    @Query('negocioId') negocioId: string,
  ) {
    const cliente = await this.clientesService.buscarPorId(negocioId, clienteId);

    if (!cliente) {
      throw new NotFoundError('Cliente não encontrado.');
    }

    return ClientePresenter.toHTTP(cliente);
  }

  // PATCH /admin/clientes/:id — atualiza dados cadastrais. O `tipo` NÃO entra
  // aqui: regra de negócio (atribuído só na criação) refletida no DTO e no
  // AtualizarClienteInput da Application.
  @Patch(':id')
  async atualizar(
    @Param('id') clienteId: string,
    @Body() body: AtualizarClienteDto,
  ) {
    const cliente = await this.clientesService.atualizar(clienteId, body);

    return ClientePresenter.toHTTP(cliente);
  }

  // DELETE /admin/clientes/:id?negocioId=xxx — remove respeitando o escopo do
  // negócio. Sucesso devolve 204 No Content (sem corpo).
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @Param('id') clienteId: string,
    @Query('negocioId') negocioId: string,
  ) {
    await this.clientesService.remover(negocioId, clienteId);
  }
}
