import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

// Body da rota POST /admin/orcamentos/:id/itens.
// Adiciona um serviço do catálogo a um orçamento existente. negocioId vai no
// body (regra temporária sem autenticação); orcamentoId vem do path.
export class AdicionarItemOrcamentoDto {
  @IsString()
  negocioId: string;

  @IsString()
  servicoId: string;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}
