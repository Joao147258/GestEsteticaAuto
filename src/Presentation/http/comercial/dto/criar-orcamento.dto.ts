import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// Item da criação de orçamento no painel administrativo.
// Um serviço do catálogo com a quantidade e o valor negociado.
export class CriarOrcamentoItemDto {
  @IsString()
  servicoId: string;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}

// DTO HTTP da rota POST /admin/orcamentos.
// Contém apenas os dados necessários para criar um orçamento pelo painel.
// NÃO possui campo origem: a rota administrativa define origem = PAINEL
// internamente. O ValidationPipe (whitelist + forbidNonWhitelisted) rejeita
// campos extras enviados pelo cliente — inclusive origem: SITE.
export class CriarOrcamentoDto {
  @IsString()
  negocioId: string;

  @IsString()
  clienteId: string;

  @IsString()
  veiculoId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriarOrcamentoItemDto)
  itens: CriarOrcamentoItemDto[];
}
