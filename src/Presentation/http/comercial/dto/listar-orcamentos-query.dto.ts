import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

// StatusOrcamento do Domain é um union type (sem valor runtime), então a
// validação usa @IsIn com a lista literal dos valores. Manter em sincronia
// com src/Domain/comercial/status_orcamento_types.ts — se o Domain ganhar um
// enum runtime, migrar para @IsEnum.
const STATUS_ORCAMENTO_VALIDOS = [
  'RASCUNHO',
  'EM_ABERTO',
  'ACEITO',
  'RECUSADO',
  'CANCELADO',
  'EXPIRADO',
] as const;

// Query string da rota GET /admin/orcamentos.
// Apenas filtros suportados pelo ListarOrcamentosUseCase: a Presentation não
// inventa filtro que a Application não conheça. negocioId é obrigatório —
// a API nunca lista orçamento sem escopo de negócio.
export class ListarOrcamentosQueryDto {
  @IsString()
  negocioId: string;

  @IsOptional()
  @IsIn(STATUS_ORCAMENTO_VALIDOS)
  status?: (typeof STATUS_ORCAMENTO_VALIDOS)[number];

  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number;
}
