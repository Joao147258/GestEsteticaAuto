import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para registrar perda de estoque interno (avaria, vazamento, descarte).
// Rota: POST /admin/estoque-interno/:produtoId/perdas
export class RegistrarPerdaEstoqueInternoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
