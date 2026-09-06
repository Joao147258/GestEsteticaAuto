import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para criação de serviço no catálogo (rota POST /admin/servicos).
// Valida os campos obrigatórios pelo domínio (negocioId, nome, precoBase).
// Campos opcionais: descricao, categoriaId, duracaoEstimadaMinutos, observacoes.
export class CriarServicoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @Min(0)
  precoBase: number;

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
