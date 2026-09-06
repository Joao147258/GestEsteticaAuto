import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para query params da listagem de serviços (rota GET /admin/servicos).
// Suporta busca por texto (nome/descrição), paginação e filtro por status ativo.
export class ListarServicosQueryDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

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

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  ativo?: boolean;
}
