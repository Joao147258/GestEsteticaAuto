import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// ListarOrdensServicoQueryDto — valida os parâmetros de consulta e filtros na listagem de OSs.
// Exige negocioId obrigatório para isolamento multi-tenant seguro na consulta ao banco.
// Suporta filtros por status, cliente, veículo, orçamento, texto de busca, período e paginação.
// Conversa com o endpoint GET /admin/ordens-servico.
export class ListarOrdensServicoQueryDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para listar ordens de serviço' })
  negocioId: string;

  @IsOptional()
  @IsString({ message: 'status deve ser uma string com status válido da OS' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'clienteId deve ser uma string válida' })
  clienteId?: string;

  @IsOptional()
  @IsString({ message: 'veiculoId deve ser uma string válida' })
  veiculoId?: string;

  @IsOptional()
  @IsString({ message: 'orcamentoId deve ser uma string válida' })
  orcamentoId?: string;

  @IsOptional()
  @IsString({ message: 'busca deve ser uma string' })
  busca?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pagina deve ser um número inteiro' })
  @Min(1, { message: 'pagina deve ser maior ou igual a 1' })
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limite deve ser um número inteiro' })
  @Min(1, { message: 'limite deve ser no mínimo 1' })
  @Max(100, { message: 'limite não pode exceder 100 itens por página' })
  limite?: number;

  @IsOptional()
  @IsDateString({}, { message: 'dataInicio deve ser uma data ISO válida' })
  dataInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dataFim deve ser uma data ISO válida' })
  dataFim?: string;
}
