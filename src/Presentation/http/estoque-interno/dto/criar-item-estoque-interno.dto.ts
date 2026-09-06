import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type { UnidadeMedida } from '../../../../Domain';

const UNIDADES_MEDIDA_VALIDAS: UnidadeMedida[] = [
  'UNIDADE',
  'ML',
  'LITRO',
  'GRAMA',
  'KG',
  'METRO',
  'PACOTE',
  'CAIXA',
];

// DTO HTTP para criação do estoque interno de um produto (rota POST /admin/estoque-interno).
export class CriarItemEstoqueInternoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsString()
  @IsNotEmpty()
  produtoId: string;

  @IsIn(UNIDADES_MEDIDA_VALIDAS)
  unidadeMedida: UnidadeMedida;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeAtual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeInicial?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  custoUnitarioAproximado?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueMinimo?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
