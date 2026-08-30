import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  CriarOrcamentoUseCase,
  OrcamentoOutputDTO,
} from '../../../Application/comercial';
import { validationPipeConfig } from '../pipes/validation-pipe.config';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { OrcamentoPresenter } from './presenters/orcamento.presenter';

// OrcamentosController — rota administrativa de orçamentos.
// A Presentation apenas recebe a requisição HTTP, monta o input do use case
// (definindo origem = PAINEL) e devolve o resultado. Nenhuma regra de negócio
// fica aqui: validação de referências, criação e cálculo de valores são do
// CriarOrcamentoUseCase / domínio. Não acessa Prisma.
@Controller('admin/orcamentos')
@UsePipes(validationPipeConfig)
export class OrcamentosController {
  constructor(
    private readonly criarOrcamentoUseCase: CriarOrcamentoUseCase,
  ) {}

  // POST /admin/orcamentos — cria um orçamento manual pelo painel.
  // A origem é SEMPRE PAINEL nesta rota: o DTO não expõe o campo e o
  // ValidationPipe (whitelist + forbidNonWhitelisted) rejeita origem: SITE
  // vinda no body.
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
}
