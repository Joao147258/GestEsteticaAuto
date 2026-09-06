import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Query string da rota GET /admin/veiculos (listagem).
// Apenas filtros suportados pelo ListarVeiculosUseCase da Application:
// negocioId é obrigatório para manter o escopo multi-tenant.
// pagina/limite vêm como string na query e são convertidos via @Type.
export class ListarVeiculosQueryDto {
  @IsString()
  @IsNotEmpty()
  negocioId!: string;

  @IsOptional()
  @IsString()
  clienteId?: string;

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
