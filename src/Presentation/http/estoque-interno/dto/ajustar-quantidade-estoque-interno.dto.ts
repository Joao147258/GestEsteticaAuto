import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para ajuste de saldo físico de estoque interno (inventário).
// Rota: POST /admin/estoque-interno/:produtoId/ajustes
export class AjustarQuantidadeEstoqueInternoDto {
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @IsNumber()
  @Min(0)
  novaQuantidade: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
