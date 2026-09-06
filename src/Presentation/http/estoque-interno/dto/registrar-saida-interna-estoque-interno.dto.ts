import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para registrar saída interna manual no estoque interno.
// Rota: POST /admin/estoque-interno/:produtoId/saidas
export class RegistrarSaidaInternaEstoqueInternoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsOptional()
  @IsString()
  referenciaId?: string;

  @IsOptional()
  @IsString()
  referenciaTipo?: string;

  @IsOptional()
  @IsString()
  referenciaItemId?: string;
}
