import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
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

// DTO HTTP para vincular produto a serviço como consumo operacional (ficha técnica).
// Rota: POST /admin/servicos/:id/consumos
export class AdicionarConsumoInsumoServicoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsString()
  @IsNotEmpty()
  produtoId: string;

  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @IsIn(UNIDADES_MEDIDA_VALIDAS)
  unidadeMedida: UnidadeMedida;
}
