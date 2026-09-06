import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

// ItemParcelaTituloDto — define a estrutura de cada parcela no parcelamento customizado.
export class ItemParcelaTituloDto {
  @IsOptional()
  @IsInt({ message: 'numero da parcela deve ser inteiro' })
  numero?: number;

  @IsOptional()
  @IsString({ message: 'tipo deve ser string (PARCELA ou SINAL)' })
  tipo?: string;

  @IsNumber({}, { message: 'valor deve ser numérico' })
  @IsPositive({ message: 'valor da parcela deve ser maior que zero' })
  valor: number;

  @IsDateString({}, { message: 'dataVencimento deve ser uma data ISO válida' })
  dataVencimento: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

// GerarTituloReceberDto — valida a requisição de geração de título financeiro a receber.
// Permite gerar a partir de um orçamento aprovado (informando orcamentoId) ou com payload financeiro avulso.
// O negocioId é obrigatório para isolamento multi-tenant.
// Conversa com o endpoint POST /admin/financeiro/titulos.
export class GerarTituloReceberDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório' })
  negocioId: string;

  @IsOptional()
  @IsString({ message: 'orcamentoId deve ser uma string válida' })
  orcamentoId?: string;

  @IsOptional()
  @IsString({ message: 'origem deve ser uma string válida' })
  origem?: string;

  @IsOptional()
  @IsString({ message: 'origemId deve ser uma string válida' })
  origemId?: string;

  @IsOptional()
  @IsString({ message: 'clienteId deve ser uma string válida' })
  clienteId?: string;

  @IsOptional()
  @IsString({ message: 'descricao deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsNumber({}, { message: 'valorOriginal deve ser numérico' })
  @IsPositive({ message: 'valorOriginal deve ser positivo' })
  valorOriginal?: number;

  @IsOptional()
  @IsNumber({}, { message: 'valorDesconto deve ser numérico' })
  valorDesconto?: number;

  @IsOptional()
  @IsNumber({}, { message: 'valorAcrescimo deve ser numérico' })
  valorAcrescimo?: number;

  @IsOptional()
  @IsDateString({}, { message: 'dataVencimento deve ser uma data ISO válida' })
  dataVencimento?: string;

  @IsOptional()
  @IsArray({ message: 'parcelas deve ser uma lista de parcelas' })
  @ValidateNested({ each: true })
  @Type(() => ItemParcelaTituloDto)
  parcelas?: ItemParcelaTituloDto[];

  @IsOptional()
  @IsString()
  observacoes?: string;
}
