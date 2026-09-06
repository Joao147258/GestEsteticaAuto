import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// DTO HTTP para registrar entrada (compra/reposição) no estoque interno.
// Rota: POST /admin/estoque-interno/:produtoId/entradas
export class RegistrarEntradaEstoqueInternoDto {
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
