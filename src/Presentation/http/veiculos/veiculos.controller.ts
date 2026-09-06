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
import { VeiculosService } from './veiculos.service';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { ListarVeiculosQueryDto } from './dto/listar-veiculos-query.dto';
import { VeiculoPresenter } from './presenters/veiculo.presenter';

// VeiculosController — rotas administrativas de veículos (painel).
// A Presentation apenas recebe params/query/body, delega ao VeiculosService
// (que orquestra os use cases da Application) e devolve a resposta via
// presenter. Nenhuma regra de negócio fica aqui.
@Controller('admin/veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  // POST /admin/veiculos — cria um veículo vinculado a um cliente do negócio.
  @Post()
  async criar(@Body() body: CriarVeiculoDto) {
    const veiculo = await this.veiculosService.criar(body);

    return VeiculoPresenter.toHTTP(veiculo);
  }

  // GET /admin/veiculos?negocioId=xxx&clienteId=&busca=&pagina=&limite=
  // Lista veículos do negócio com os filtros suportados.
  @Get()
  async listar(@Query() query: ListarVeiculosQueryDto) {
    const veiculos = await this.veiculosService.listar(query);

    return VeiculoPresenter.manyToHTTP(veiculos);
  }

  // GET /admin/veiculos/:id?negocioId=xxx — busca um veículo pelo id no escopo do negócio.
  // Ausência dispara NotFoundError, mapeado para 404 pelo filtro global.
  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
    @Query('negocioId') negocioId: string,
  ) {
    const veiculo = await this.veiculosService.buscarPorId(negocioId, id);

    return VeiculoPresenter.toHTTP(veiculo);
  }

  // PATCH /admin/veiculos/:id — atualiza dados cadastrais simples do veículo.
  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() body: AtualizarVeiculoDto,
  ) {
    const veiculo = await this.veiculosService.atualizar(id, body);

    return VeiculoPresenter.toHTTP(veiculo);
  }

  // DELETE /admin/veiculos/:id?negocioId=xxx — remove o veículo respeitando o escopo do negócio.
  // Sucesso devolve 204 No Content.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @Param('id') id: string,
    @Query('negocioId') negocioId: string,
  ) {
    await this.veiculosService.remover(negocioId, id);
  }
}
