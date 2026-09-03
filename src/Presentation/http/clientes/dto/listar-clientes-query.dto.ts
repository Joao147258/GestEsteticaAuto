import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Query string da rota GET /clientes (listagem).
// Apenas filtros suportados pelo ListarClientesUseCase: a Presentation não
// inventa filtro que a Application não conheça. negocioId é obrigatório —
// a API nunca lista cliente sem escopo de negócio.
// pagina/limite vêm como string na query e são convertidos via @Type (por
// isso class-transformer entra só aqui — mesma regra do comercial).
export class ListarClientesQueryDto {
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
}
