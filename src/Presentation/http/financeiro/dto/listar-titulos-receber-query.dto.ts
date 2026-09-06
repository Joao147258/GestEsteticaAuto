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

// ListarTitulosReceberQueryDto — valida os filtros e paginação para consulta de títulos a receber.
// Exige negocioId obrigatório para assegurar multi-tenant isolation em ambiente compartilhado.
// Conversa com o endpoint GET /admin/financeiro/titulos.
export class ListarTitulosReceberQueryDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para listar títulos financeiros' })
  negocioId: string;

  @IsOptional()
  @IsString({ message: 'clienteId deve ser uma string válida' })
  clienteId?: string;

  @IsOptional()
  @IsString({ message: 'origem deve ser uma string válida' })
  origem?: string;

  @IsOptional()
  @IsString({ message: 'origemId deve ser uma string válida' })
  origemId?: string;

  @IsOptional()
  @IsString({ message: 'status deve ser uma string válida' })
  status?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dataVencimentoInicio deve ser uma data ISO válida' })
  dataVencimentoInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dataVencimentoFim deve ser uma data ISO válida' })
  dataVencimentoFim?: string;

  @IsOptional()
  @IsString({ message: 'busca deve ser uma string' })
  busca?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pagina deve ser um número inteiro' })
  @Min(1, { message: 'pagina deve ser no mínimo 1' })
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limite deve ser um número inteiro' })
  @Min(1, { message: 'limite deve ser no mínimo 1' })
  @Max(100, { message: 'limite não pode exceder 100 itens' })
  limite?: number;
}
