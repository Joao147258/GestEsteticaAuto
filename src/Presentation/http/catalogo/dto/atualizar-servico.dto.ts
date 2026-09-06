import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para atualização de serviço existente (rota PATCH /admin/servicos/:id).
// negocioId é obrigatório para manter o escopo multi-tenant do negócio.
// Todos os demais campos são opcionais (atualização parcial).
export class AtualizarServicoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precoBase?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duracaoEstimadaMinutos?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
